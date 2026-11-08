import { getPool } from "../config/db.js";
import { getLocalDateString } from "../utils/date.js";

export const quizRepository = {
  async getQuizByLessonId(lessonId) {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT * FROM quizzes WHERE lesson_id = ?",
      [lessonId],
    );
    return rows[0] || null;
  },

  async getQuizById(quizId) {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT * FROM quizzes WHERE id = ?", [
      quizId,
    ]);
    return rows[0] || null;
  },

  // Student-facing: strips is_correct for anti-cheat
  async getStudentQuiz(lessonId) {
    const pool = await getPool();
    const quiz = await this.getQuizByLessonId(lessonId);
    if (!quiz) return null;

    const [questions] = await pool.query(
      "SELECT id, quiz_id, question_text, question_type, display_order FROM quiz_questions WHERE quiz_id = ? ORDER BY display_order ASC",
      [quiz.id],
    );

    const questionIds = questions.map((q) => q.id);
    let options = [];
    if (questionIds.length > 0) {
      // Fetch options without is_correct
      const [optRows] = await pool.query(
        "SELECT id, question_id, option_text, display_order FROM quiz_options WHERE question_id IN (" +
          questionIds.map(() => "?").join(",") +
          ") ORDER BY display_order ASC",
        questionIds,
      );
      options = optRows;
    }

    const optionsByQuestion = {};
    for (const opt of options) {
      if (!optionsByQuestion[opt.question_id]) {
        optionsByQuestion[opt.question_id] = [];
      }
      optionsByQuestion[opt.question_id].push({
        id: opt.id,
        text: opt.option_text,
        displayOrder: opt.display_order,
      });
    }

    return {
      id: quiz.id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      passingScore: quiz.passing_score,
      maxScore: quiz.max_score,
      totalQuestions: quiz.total_questions,
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.question_text,
        type: q.question_type,
        displayOrder: q.display_order,
        options: optionsByQuestion[q.id] || [],
      })),
    };
  },

  // Backend grading and attempt recording
  async evaluateAndSubmit(userId, quizId, userAnswers = {}) {
    const pool = await getPool();
    const quiz = await this.getQuizById(quizId);
    if (!quiz) {
      throw new Error(`Bài kiểm tra ${quizId} không tồn tại.`);
    }

    // Get current lesson
    const [lessonRows] = await pool.query(
      "SELECT * FROM lessons WHERE id = ?",
      [quiz.lesson_id],
    );
    const lesson = lessonRows[0];

    // Fetch all questions and their correct options
    const [questions] = await pool.query(
      "SELECT id, question_text, explanation, display_order FROM quiz_questions WHERE quiz_id = ? ORDER BY display_order ASC",
      [quiz.id],
    );

    const questionIds = questions.map((q) => q.id);
    const [options] = await pool.query(
      "SELECT id, question_id, option_text, is_correct FROM quiz_options WHERE question_id IN (" +
        questionIds.map(() => "?").join(",") +
        ")",
      questionIds,
    );

    const optionsByQ = {};
    const correctOptionByQ = {};
    for (const opt of options) {
      if (!optionsByQ[opt.question_id]) optionsByQ[opt.question_id] = [];
      optionsByQ[opt.question_id].push(opt);
      if (opt.is_correct === 1 || opt.is_correct === true) {
        correctOptionByQ[opt.question_id] = opt;
      }
    }

    let score = 0;
    const gradedQuestions = [];
    const answersToInsert = [];

    for (const q of questions) {
      const selected = userAnswers[q.id];
      const correctOpt = correctOptionByQ[q.id];
      const allOpts = optionsByQ[q.id] || [];

      // Check if selected matches option ID or option text
      let isCorrect = false;
      let selectedOptionId = null;
      let selectedText = null;

      if (selected !== undefined && selected !== null) {
        const foundOpt = allOpts.find(
          (o) =>
            String(o.id) === String(selected) ||
            String(o.option_text).trim() === String(selected).trim(),
        );
        if (foundOpt) {
          selectedOptionId = foundOpt.id;
          selectedText = foundOpt.option_text;
          isCorrect = foundOpt.is_correct === 1 || foundOpt.is_correct === true;
        } else {
          selectedText = String(selected);
        }
      }

      if (isCorrect) {
        score++;
      }

      gradedQuestions.push({
        id: q.id,
        prompt: q.question_text,
        explanation: q.explanation,
        userAnswer: selectedText,
        correctAnswer: correctOpt?.option_text || "",
        isCorrect,
      });

      answersToInsert.push({
        questionId: q.id,
        selectedOptionId,
        selectedText,
        isCorrect: isCorrect ? 1 : 0,
      });
    }

    const isPassed = score >= quiz.passing_score;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert quiz_attempts
      const [attemptResult] = await conn.query(
        "INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, passing_score, is_passed) VALUES (?, ?, ?, ?, ?, ?)",
        [
          userId,
          quiz.id,
          score,
          questions.length,
          quiz.passing_score,
          isPassed ? 1 : 0,
        ],
      );

      const attemptId = attemptResult.insertId;

      // 2. Insert quiz_answers
      for (const ans of answersToInsert) {
        await conn.query(
          "INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, selected_text, is_correct) VALUES (?, ?, ?, ?, ?)",
          [
            attemptId,
            ans.questionId,
            ans.selectedOptionId,
            ans.selectedText,
            ans.isCorrect,
          ],
        );
      }

      // 3. If passed: update lesson progress & unlock next day
      let nextLessonUnlocked = null;
      if (isPassed && lesson) {
        // Mark current lesson completed
        const [existingProg] = await conn.query(
          "SELECT id FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?",
          [userId, lesson.id],
        );
        if (existingProg && existingProg.length > 0) {
          await conn.query(
            "UPDATE user_lesson_progress SET status = 'completed', progress_percent = 100, completed_at = NOW() WHERE id = ?",
            [existingProg[0].id],
          );
        } else {
          await conn.query(
            "INSERT INTO user_lesson_progress (user_id, lesson_id, status, progress_percent, completed_at) VALUES (?, ?, 'completed', 100, NOW())",
            [userId, lesson.id],
          );
        }

        // Check if next day lesson exists
        const nextDayNumber = lesson.day_number + 1;
        const [nextLessonRows] = await conn.query(
          "SELECT id, day_number, title FROM lessons WHERE day_number = ?",
          [nextDayNumber],
        );

        if (nextLessonRows && nextLessonRows.length > 0) {
          const nextLesson = nextLessonRows[0];
          nextLessonUnlocked = nextLesson;

          const [existingNextProg] = await conn.query(
            "SELECT id, status FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?",
            [userId, nextLesson.id],
          );

          if (!existingNextProg || existingNextProg.length === 0) {
            await conn.query(
              "INSERT INTO user_lesson_progress (user_id, lesson_id, status, progress_percent) VALUES (?, ?, 'available', 0)",
              [userId, nextLesson.id],
            );
          } else if (existingNextProg[0].status === "locked") {
            await conn.query(
              "UPDATE user_lesson_progress SET status = 'available' WHERE id = ?",
              [existingNextProg[0].id],
            );
          }
        }
      }

      // 4. Record study activity
      const today = getLocalDateString();
      await conn.query(
        "INSERT INTO user_study_activity (user_id, activity_date, activity_type, xp_earned) VALUES (?, ?, 'quiz_submit', ?)",
        [userId, today, isPassed ? 50 : 20],
      );

      await conn.commit();

      return {
        quizId: quiz.id,
        lessonId: quiz.lesson_id,
        title: quiz.title,
        score,
        totalQuestions: questions.length,
        passingScore: quiz.passing_score,
        isPassed,
        percentage: Math.round((score / questions.length) * 100),
        nextLessonUnlocked,
        questions: gradedQuestions,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getQuizHistory(userId, quizId) {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, score, total_questions, passing_score, is_passed, submitted_at FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY submitted_at DESC",
      [userId, quizId],
    );
    return rows;
  },
};
