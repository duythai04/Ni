import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPool } from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export async function importLessons() {
  console.log('[Importer] Starting lesson import from JSON...');
  const pool = await getPool();

  // Find json file: first check project data dir, then Downloads fallback
  let jsonPath = path.resolve(__dirname, '../../data/japanese_n5_days_01_05.json');
  if (!fs.existsSync(jsonPath)) {
    jsonPath = path.resolve('c:/Users/Acer/Downloads/japanese_n5_days_01_05.json');
  }

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Data file not found at: ${jsonPath}`);
  }

  console.log(`[Importer] Reading dataset from: ${jsonPath}`);
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  if (!data.course || !Array.isArray(data.lessons)) {
    throw new Error('Invalid JSON format: missing "course" or "lessons" array.');
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insert or update course
    const { course } = data;
    console.log(`[Importer] Processing course: ${course.title} (${course.id})`);

    const [existingCourse] = await conn.query('SELECT id FROM courses WHERE id = ?', [course.id]);
    if (existingCourse && existingCourse.length > 0) {
      await conn.query(
        'UPDATE courses SET title = ?, description = ?, level = ?, total_days = ? WHERE id = ?',
        [course.title, course.description || '', 'N5', course.totalDaysPlanned || 90, course.id]
      );
    } else {
      await conn.query(
        'INSERT INTO courses (id, title, description, level, total_days) VALUES (?, ?, ?, ?, ?)',
        [course.id, course.title, course.description || '', 'N5', course.totalDaysPlanned || 90]
      );
    }

    // 2. Process lessons
    for (const lesson of data.lessons) {
      console.log(`[Importer] Processing Day ${lesson.day}: ${lesson.title} (${lesson.id})`);

      const passingScore = lesson.assessment?.passingScore ?? 8;
      const objectivesJson = JSON.stringify(lesson.learningObjectives || []);

      // Check if lesson already exists
      const [existingLesson] = await conn.query('SELECT id FROM lessons WHERE id = ?', [lesson.id]);
      if (existingLesson && existingLesson.length > 0) {
        await conn.query(
          `UPDATE lessons SET 
            course_id = ?, day_number = ?, title = ?, slug = ?, description = ?, 
            estimated_minutes = ?, passing_score = ?, prerequisite_lesson_id = ?, 
            learning_objectives_json = ?, status = ?
           WHERE id = ?`,
          [
            course.id,
            lesson.day,
            lesson.title,
            lesson.slug || `ngay-0${lesson.day}`,
            lesson.learningObjectives?.join(', ') || '',
            lesson.estimatedMinutes || 60,
            passingScore,
            lesson.prerequisiteLessonId || null,
            objectivesJson,
            'available',
            lesson.id,
          ]
        );
      } else {
        await conn.query(
          `INSERT INTO lessons 
            (id, course_id, day_number, title, slug, description, estimated_minutes, passing_score, prerequisite_lesson_id, learning_objectives_json, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lesson.id,
            course.id,
            lesson.day,
            lesson.title,
            lesson.slug || `ngay-0${lesson.day}`,
            lesson.learningObjectives?.join(', ') || '',
            lesson.estimatedMinutes || 60,
            passingScore,
            lesson.prerequisiteLessonId || null,
            objectivesJson,
            'available',
          ]
        );
      }

      // Clean existing sub-items for idempotent re-seeding without deleting user progress
      await conn.query('DELETE FROM lesson_sections WHERE lesson_id = ?', [lesson.id]);
      await conn.query('DELETE FROM hiragana_characters WHERE lesson_id = ?', [lesson.id]);
      await conn.query('DELETE FROM vocabulary WHERE lesson_id = ?', [lesson.id]);
      await conn.query('DELETE FROM conversation_examples WHERE lesson_id = ?', [lesson.id]);

      // Handle quiz: check if existing quiz exists to clean options & questions safely
      const [existingQuiz] = await conn.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lesson.id]);
      if (existingQuiz && existingQuiz.length > 0) {
        const quizId = existingQuiz[0].id;
        const [qList] = await conn.query('SELECT id FROM quiz_questions WHERE quiz_id = ?', [quizId]);
        for (const q of qList) {
          await conn.query('DELETE FROM quiz_options WHERE question_id = ?', [q.id]);
        }
        await conn.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);
        await conn.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
      }

      // 3. Import sections
      if (Array.isArray(lesson.sections)) {
        for (let i = 0; i < lesson.sections.length; i++) {
          const sec = lesson.sections[i];
          const contentJson = JSON.stringify(sec.tasks || sec.items || []);
          await conn.query(
            'INSERT INTO lesson_sections (lesson_id, section_key, section_type, title, content_json, display_order) VALUES (?, ?, ?, ?, ?, ?)',
            [lesson.id, sec.id, sec.type, sec.title, contentJson, i + 1]
          );

          // Alphabet items
          if (sec.type === 'alphabet' && Array.isArray(sec.items)) {
            for (let j = 0; j < sec.items.length; j++) {
              const charItem = sec.items[j];
              await conn.query(
                `INSERT INTO hiragana_characters 
                  (lesson_id, character_text, romaji, pronunciation_note, writing_practice_count, display_order)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  lesson.id,
                  charItem.character,
                  charItem.romaji,
                  charItem.pronunciationNote || '',
                  charItem.writingPracticeCount || 10,
                  j + 1,
                ]
              );
            }
          }

          // Vocabulary items
          if (sec.type === 'vocabulary' && Array.isArray(sec.items)) {
            for (let j = 0; j < sec.items.length; j++) {
              const vocItem = sec.items[j];
              await conn.query(
                `INSERT INTO vocabulary 
                  (lesson_id, japanese, romaji, meaning_vi, example_sentence, audio_url, is_preview, display_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  lesson.id,
                  vocItem.japanese,
                  vocItem.romaji,
                  vocItem.meaningVi,
                  vocItem.exampleSentence || '',
                  vocItem.audioUrl || null,
                  vocItem.isPreview ? 1 : 0,
                  j + 1,
                ]
              );
            }
          }

          // Conversation items
          if (sec.type === 'conversation' && Array.isArray(sec.items)) {
            for (let j = 0; j < sec.items.length; j++) {
              const conItem = sec.items[j];
              await conn.query(
                `INSERT INTO conversation_examples 
                  (lesson_id, japanese, romaji, translation_vi, explanation, display_order)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  lesson.id,
                  conItem.japanese,
                  conItem.romaji,
                  conItem.translationVi,
                  conItem.explanationVi || '',
                  j + 1,
                ]
              );
            }
          }
        }
      }

      // 4. Import Quiz & Questions & Options
      if (lesson.assessment && Array.isArray(lesson.assessment.questions)) {
        const quiz = lesson.assessment;
        await conn.query(
          'INSERT INTO quizzes (id, lesson_id, title, passing_score, max_score, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
          [quiz.id, lesson.id, quiz.title, quiz.passingScore, quiz.maxScore, quiz.questions.length]
        );

        for (let qIdx = 0; qIdx < quiz.questions.length; qIdx++) {
          const q = quiz.questions[qIdx];
          await conn.query(
            `INSERT INTO quiz_questions 
              (id, quiz_id, question_text, question_type, explanation, display_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [q.id, quiz.id, q.prompt, q.type || 'multiple_choice', q.explanation || '', qIdx + 1]
          );

          if (Array.isArray(q.options)) {
            for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
              const optText = q.options[oIdx];
              const isCorrect = (String(optText).trim() === String(q.correctAnswer).trim()) ? 1 : 0;
              await conn.query(
                `INSERT INTO quiz_options (question_id, option_text, is_correct, display_order) VALUES (?, ?, ?, ?)`,
                [q.id, optText, isCorrect, oIdx + 1]
              );
            }
          }
        }
      }
    }

    await conn.commit();
    console.log('[Importer] Successfully imported all 5 lessons, sections, vocabulary, conversations, and quizzes!');
  } catch (err) {
    await conn.rollback();
    console.error('[Importer Error] Failed to import lessons, rolled back transaction.', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('importLessons.js')) {
  importLessons()
    .then(() => {
      console.log('[Importer] Done.');
    })
    .catch((err) => {
      console.error('[Importer Fatal]', err);
      process.exitCode = 1;
    });
}
