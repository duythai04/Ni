import { getPool } from "../config/db.js";
import { getLocalDateString } from "../utils/date.js";

export const progressRepository = {
  async getDashboard(userId) {
    const pool = await getPool();

    // 1. Completed lessons
    const [completedRows] = await pool.query(
      "SELECT count(*) as count FROM user_lesson_progress WHERE user_id = ? AND status = 'completed'",
      [userId],
    );
    const completedDays = completedRows[0]?.count || 0;

    // 2. Current day being studied: earliest available/in_progress or day 1
    const [currentDayRows] = await pool.query(
      `SELECT l.day_number, l.title, l.id, p.status, p.progress_percent 
       FROM lessons l 
       LEFT JOIN user_lesson_progress p ON l.id = p.lesson_id AND p.user_id = ?
       WHERE p.status != 'completed' OR p.status IS NULL
       ORDER BY l.day_number ASC LIMIT 1`,
      [userId],
    );
    const currentLesson = currentDayRows[0] || {
      day_number: 1,
      title: "Nguyên âm Hiragana",
    };

    // 3. Total vocabulary mastered
    const [vocabRows] = await pool.query(
      "SELECT count(*) as count FROM user_vocabulary_progress WHERE user_id = ? AND status = 'remembered'",
      [userId],
    );
    const masteredVocab = vocabRows[0]?.count || 0;

    // 4. Calculate study streak (consecutive days of activity)
    const [activityRows] = await pool.query(
      `SELECT DISTINCT
     DATE_FORMAT(activity_date, '%Y-%m-%d') AS activity_date
   FROM user_study_activity
   WHERE user_id = ?
   ORDER BY activity_date DESC`,
      [userId],
    );

    let streak = 0;
    if (activityRows && activityRows.length > 0) {
      const dates = new Set(
        activityRows.map((r) => String(r.activity_date).substring(0, 10)),
      );
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayStr = getLocalDateString(today);
      const yestStr = getLocalDateString(yesterday);

      let checkDate = null;
      if (dates.has(todayStr)) {
        checkDate = new Date(today);
      } else if (dates.has(yestStr)) {
        checkDate = new Date(yesterday);
      }

      if (checkDate) {
        while (true) {
          const checkStr = getLocalDateString(checkDate);
          if (dates.has(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // 5. Total lessons in system
    const [totalLessonsRows] = await pool.query(
      "SELECT count(*) as count FROM lessons",
    );
    const totalLessons = totalLessonsRows[0]?.count || 5;

    // 6. Recent quiz attempt
    const [recentQuiz] = await pool.query(
      `SELECT a.score, a.total_questions, a.is_passed, a.submitted_at, q.title as quiz_title
       FROM quiz_attempts a
       JOIN quizzes q ON a.quiz_id = q.id
       WHERE a.user_id = ?
       ORDER BY a.submitted_at DESC LIMIT 1`,
      [userId],
    );

    // 7. Activity dates for calendar
    const studyDates = (activityRows || []).map((r) =>
      String(r.activity_date).substring(0, 10),
    );

    // Progress percentage based on 90 days total planned
    const percentOverall = Math.min(
      100,
      Math.round((completedDays / 90) * 100),
    );

    return {
      currentDay: currentLesson.day_number || 1,
      currentLessonTitle: currentLesson.title,
      completedDays,
      totalPlannedDays: 90,
      totalAvailableLessons: totalLessons,
      completionPercent: percentOverall,
      masteredVocabCount: masteredVocab,
      studyStreak: Math.max(streak, 0),
      recentQuiz: recentQuiz[0] || null,
      studyDates,
    };
  },

  async getUserLessonProgress(userId) {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT l.id as lesson_id, l.day_number, l.title, p.status, p.progress_percent, p.completed_at
       FROM lessons l
       LEFT JOIN user_lesson_progress p ON l.id = p.lesson_id AND p.user_id = ?
       ORDER BY l.day_number ASC`,
      [userId],
    );
    return rows;
  },

  async updateLessonProgress(userId, lessonId, status, progressPercent) {
    const pool = await getPool();
    const [existing] = await pool.query(
      "SELECT id FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?",
      [userId, lessonId],
    );

    const completedAtSql = status === "completed" ? "datetime('now')" : "NULL";

    if (existing && existing.length > 0) {
      await pool.query(
        `UPDATE user_lesson_progress SET status = ?, progress_percent = ?, completed_at = ${completedAtSql} WHERE id = ?`,
        [status, progressPercent, existing[0].id],
      );
    } else {
      await pool.query(
        `INSERT INTO user_lesson_progress (user_id, lesson_id, status, progress_percent, completed_at) VALUES (?, ?, ?, ?, ${completedAtSql})`,
        [userId, lessonId, status, progressPercent],
      );
    }
  },

  async updateSectionProgress(
    userId,
    lessonId,
    sectionKey,
    isCompleted = true,
  ) {
    const pool = await getPool();
    const [existing] = await pool.query(
      "SELECT id FROM user_section_progress WHERE user_id = ? AND lesson_id = ? AND section_key = ?",
      [userId, lessonId, sectionKey],
    );

    if (existing && existing.length > 0) {
      await pool.query(
        "UPDATE user_section_progress SET is_completed = ?, completed_at = datetime('now') WHERE id = ?",
        [isCompleted ? 1 : 0, existing[0].id],
      );
    } else {
      await pool.query(
        "INSERT INTO user_section_progress (user_id, lesson_id, section_key, is_completed, completed_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [userId, lessonId, sectionKey, isCompleted ? 1 : 0],
      );
    }

    // Calculate section completion % for this lesson
    const [allSections] = await pool.query(
      "SELECT count(*) as count FROM lesson_sections WHERE lesson_id = ?",
      [lessonId],
    );
    const totalSecs = allSections[0]?.count || 4;

    const [completedSecs] = await pool.query(
      "SELECT count(*) as count FROM user_section_progress WHERE user_id = ? AND lesson_id = ? AND is_completed = 1",
      [userId, lessonId],
    );
    const doneSecs = completedSecs[0]?.count || 0;

    const percent = Math.min(100, Math.round((doneSecs / totalSecs) * 100));

    // Update user_lesson_progress percent
    const [existingLessonProg] = await pool.query(
      "SELECT id, status FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?",
      [userId, lessonId],
    );

    if (existingLessonProg && existingLessonProg.length > 0) {
      const currentStatus =
        existingLessonProg[0].status === "completed"
          ? "completed"
          : "in_progress";
      await pool.query(
        "UPDATE user_lesson_progress SET progress_percent = ?, status = ? WHERE id = ?",
        [percent, currentStatus, existingLessonProg[0].id],
      );
    } else {
      await pool.query(
        "INSERT INTO user_lesson_progress (user_id, lesson_id, status, progress_percent) VALUES (?, ?, 'in_progress', ?)",
        [userId, lessonId, percent],
      );
    }

    // Record activity
    const today = getLocalDateString();
    await pool.query(
      "INSERT INTO user_study_activity (user_id, activity_date, activity_type, xp_earned) VALUES (?, ?, 'section_complete', 10)",
      [userId, today],
    );

    return { sectionKey, isCompleted, lessonProgressPercent: percent };
  },

  async getStatistics(userId) {
    const pool = await getPool();

    // Total XP
    const [xpRows] = await pool.query(
      "SELECT SUM(xp_earned) as total_xp FROM user_study_activity WHERE user_id = ?",
      [userId],
    );

    // Activity counts by date (last 14 days)
    const [activityByDate] = await pool.query(
      `SELECT activity_date, count(*) as activities_count, sum(xp_earned) as daily_xp 
       FROM user_study_activity 
       WHERE user_id = ? 
       GROUP BY activity_date 
       ORDER BY activity_date ASC LIMIT 14`,
      [userId],
    );

    // Quiz scores history
    const [quizScores] = await pool.query(
      `SELECT a.score, a.total_questions, a.is_passed, a.submitted_at, q.title as quiz_title
       FROM quiz_attempts a
       JOIN quizzes q ON a.quiz_id = q.id
       WHERE a.user_id = ?
       ORDER BY a.submitted_at ASC LIMIT 10`,
      [userId],
    );

    return {
      totalXp: xpRows[0]?.total_xp || 0,
      activityByDate,
      quizScores,
    };
  },
};
