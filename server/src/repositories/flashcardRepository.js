import { getPool } from '../config/db.js';
import { getLocalDateString } from '../utils/date.js';

export const flashcardRepository = {
  async getFlashcards(userId = null, { day = null, status = 'all' } = {}) {
    const pool = await getPool();

    let query = `
      SELECT v.id, v.lesson_id, v.japanese, v.romaji, v.meaning_vi, v.example_sentence, 
             v.audio_url, l.day_number, l.title as lesson_title
      FROM vocabulary v
      JOIN lessons l ON v.lesson_id = l.id
    `;
    const params = [];
    const conditions = [];

    if (day) {
      conditions.push('l.day_number = ?');
      params.push(day);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.day_number ASC, v.display_order ASC';

    const [vocabRows] = await pool.query(query, params);

    // Fetch user progress for these vocabularies
    let userProgressMap = {};
    if (userId) {
      const [upRows] = await pool.query(
        'SELECT vocabulary_id, status, review_count, last_reviewed_at FROM user_vocabulary_progress WHERE user_id = ?',
        [userId]
      );
      for (const up of upRows) {
        userProgressMap[up.vocabulary_id] = up;
      }
    }

    const items = vocabRows.map(v => {
      const prog = userProgressMap[v.id] || { status: 'learning', review_count: 0, last_reviewed_at: null };
      return {
        id: v.id,
        lessonId: v.lesson_id,
        dayNumber: v.day_number,
        lessonTitle: v.lesson_title,
        japanese: v.japanese,
        romaji: v.romaji,
        meaningVi: v.meaning_vi,
        exampleSentence: v.example_sentence,
        audioUrl: v.audio_url,
        status: prog.status,
        reviewCount: prog.review_count,
        lastReviewedAt: prog.last_reviewed_at,
      };
    });

    if (status && status !== 'all') {
      return items.filter(i => i.status === status);
    }

    return items;
  },

  async updateVocabularyProgress(userId, vocabularyId, status) {
    const pool = await getPool();
    const validStatuses = ['learning', 'remembered', 'need_review'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Trạng thái không hợp lệ: ${status}`);
    }

    const [existing] = await pool.query(
      'SELECT id, review_count FROM user_vocabulary_progress WHERE user_id = ? AND vocabulary_id = ?',
      [userId, vocabularyId]
    );

    if (existing && existing.length > 0) {
      const nextCount = (existing[0].review_count || 0) + 1;
      await pool.query(
        "UPDATE user_vocabulary_progress SET status = ?, review_count = ?, last_reviewed_at = datetime('now') WHERE id = ?",
        [status, nextCount, existing[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO user_vocabulary_progress (user_id, vocabulary_id, status, review_count, last_reviewed_at) VALUES (?, ?, ?, 1, datetime('now'))",
        [userId, vocabularyId, status]
      );
    }

    // Record study activity
    const today = getLocalDateString();
    await pool.query(
      "INSERT INTO user_study_activity (user_id, activity_date, activity_type, xp_earned) VALUES (?, ?, 'flashcard_review', 5)",
      [userId, today]
    );

    return {
      vocabularyId,
      status,
    };
  },
};
