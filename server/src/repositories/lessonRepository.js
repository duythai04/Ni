import { getPool } from '../config/db.js';

export const lessonRepository = {
  async getAllLessons(userId = null) {
    const pool = await getPool();
    const [lessons] = await pool.query(
      'SELECT id, course_id, day_number, title, slug, description, estimated_minutes, passing_score, prerequisite_lesson_id, status as base_status FROM lessons ORDER BY day_number ASC'
    );

    let userProgress = {};
    if (userId) {
      const [progress] = await pool.query(
        'SELECT lesson_id, status, progress_percent, completed_at FROM user_lesson_progress WHERE user_id = ?',
        [userId]
      );
      for (const p of progress) {
        userProgress[p.lesson_id] = p;
      }
    }

    return lessons.map((l, index) => {
      let status = 'locked';
      let progressPercent = 0;
      let completedAt = null;

      if (index === 0) {
        status = 'available';
      }

      if (userId && userProgress[l.id]) {
        status = userProgress[l.id].status;
        progressPercent = userProgress[l.id].progress_percent;
        completedAt = userProgress[l.id].completed_at;
      }

      return {
        ...l,
        status,
        progressPercent,
        completedAt,
      };
    });
  },

  async getLessonByDay(dayNumber, userId = null) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM lessons WHERE day_number = ?', [dayNumber]);
    if (!rows || rows.length === 0) return null;
    const lesson = rows[0];

    return this.enrichLessonDetails(lesson, userId);
  },

  async getLessonById(lessonId, userId = null) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (!rows || rows.length === 0) return null;
    const lesson = rows[0];

    return this.enrichLessonDetails(lesson, userId);
  },

  async enrichLessonDetails(lesson, userId = null) {
    const pool = await getPool();

    // 1. Learning objectives
    let objectives = [];
    if (lesson.learning_objectives_json) {
      try {
        objectives = typeof lesson.learning_objectives_json === 'string'
          ? JSON.parse(lesson.learning_objectives_json)
          : lesson.learning_objectives_json;
      } catch (e) {
        objectives = [];
      }
    }

    // 2. Sections
    const [sections] = await pool.query(
      'SELECT id, section_key, section_type, title, content_json, display_order FROM lesson_sections WHERE lesson_id = ? ORDER BY display_order ASC',
      [lesson.id]
    );

    // 3. Hiragana characters
    const [characters] = await pool.query(
      'SELECT id, character_text, romaji, pronunciation_note, writing_practice_count, display_order FROM hiragana_characters WHERE lesson_id = ? ORDER BY display_order ASC',
      [lesson.id]
    );

    // 4. Vocabulary
    const [vocabulary] = await pool.query(
      'SELECT id, japanese, romaji, meaning_vi, example_sentence, audio_url, is_preview, display_order FROM vocabulary WHERE lesson_id = ? ORDER BY display_order ASC',
      [lesson.id]
    );

    // 5. Conversations
    const [conversations] = await pool.query(
      'SELECT id, japanese, romaji, translation_vi, explanation, display_order FROM conversation_examples WHERE lesson_id = ? ORDER BY display_order ASC',
      [lesson.id]
    );

    // 6. Quiz summary
    const [quizzes] = await pool.query(
      'SELECT id, title, passing_score, max_score, total_questions FROM quizzes WHERE lesson_id = ?',
      [lesson.id]
    );

    // 7. User progress if available
    let userProgress = {
      status: lesson.day_number === 1 ? 'available' : 'locked',
      progressPercent: 0,
      completedAt: null,
      completedSections: [],
    };

    if (userId) {
      const [up] = await pool.query(
        'SELECT status, progress_percent, completed_at FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
        [userId, lesson.id]
      );
      if (up && up.length > 0) {
        userProgress.status = up[0].status;
        userProgress.progressPercent = up[0].progress_percent;
        userProgress.completedAt = up[0].completed_at;
      }

      const [secProg] = await pool.query(
        'SELECT section_key FROM user_section_progress WHERE user_id = ? AND lesson_id = ? AND is_completed = 1',
        [userId, lesson.id]
      );
      userProgress.completedSections = secProg.map(s => s.section_key);
    }

    return {
      ...lesson,
      objectives,
      sections: sections.map(s => {
        let content = [];
        try {
          content = typeof s.content_json === 'string' ? JSON.parse(s.content_json) : s.content_json;
        } catch (e) {
          content = [];
        }
        return {
          ...s,
          content,
          isCompleted: userProgress.completedSections.includes(s.section_key),
        };
      }),
      characters,
      vocabulary,
      conversations,
      quiz: quizzes[0] || null,
      userProgress,
    };
  },

  async getVocabularyByLesson(lessonId, userId = null) {
    const pool = await getPool();
    const [vocabulary] = await pool.query(
      'SELECT id, lesson_id, japanese, romaji, meaning_vi, example_sentence, audio_url, is_preview, display_order FROM vocabulary WHERE lesson_id = ? ORDER BY display_order ASC',
      [lessonId]
    );

    let userVocabStatus = {};
    if (userId) {
      const [uv] = await pool.query(
        'SELECT vocabulary_id, status, review_count, last_reviewed_at FROM user_vocabulary_progress WHERE user_id = ?',
        [userId]
      );
      for (const item of uv) {
        userVocabStatus[item.vocabulary_id] = item;
      }
    }

    return vocabulary.map(v => ({
      ...v,
      userStatus: userVocabStatus[v.id]?.status || 'learning',
      reviewCount: userVocabStatus[v.id]?.review_count || 0,
      lastReviewedAt: userVocabStatus[v.id]?.last_reviewed_at || null,
    }));
  },

  async getConversationsByLesson(lessonId) {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, lesson_id, japanese, romaji, translation_vi, explanation, display_order FROM conversation_examples WHERE lesson_id = ? ORDER BY display_order ASC',
      [lessonId]
    );
    return rows;
  },
};
