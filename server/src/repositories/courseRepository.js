import { getPool } from '../config/db.js';

export const courseRepository = {
  async getCourseById(courseId) {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    return rows[0] || null;
  },

  async getAllCourses() {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at ASC');
    return rows;
  },

  async getRoadmap(courseId, userId = null) {
    const pool = await getPool();
    const course = await this.getCourseById(courseId);
    if (!course) return null;

    // Fetch lessons for days 1 to 5
    const [lessons] = await pool.query(
      'SELECT id, day_number, title, slug, description, estimated_minutes, passing_score, prerequisite_lesson_id FROM lessons WHERE course_id = ? ORDER BY day_number ASC',
      [courseId]
    );

    // Fetch user progress for these lessons if logged in
    let userProgressMap = {};
    if (userId) {
      const [progressRows] = await pool.query(
        'SELECT lesson_id, status, progress_percent, completed_at FROM user_lesson_progress WHERE user_id = ?',
        [userId]
      );
      for (const p of progressRows) {
        userProgressMap[p.lesson_id] = p;
      }
    }

    const stages = [
      {
        id: 1,
        title: 'Giai đoạn 1',
        subtitle: 'Nền tảng (Ngày 1 - 14)',
        description: 'Hiragana, Katakana, phát âm',
        icon: 'torii',
        dayRange: [1, 14],
        status: 'active',
      },
      {
        id: 2,
        title: 'Giai đoạn 2',
        subtitle: 'Ngữ pháp cơ bản (Ngày 15 - 40)',
        description: 'Mẫu câu N5, từ vựng cơ bản',
        icon: 'book',
        dayRange: [15, 40],
        status: 'coming_soon',
      },
      {
        id: 3,
        title: 'Giai đoạn 3',
        subtitle: 'Giao tiếp (Ngày 41 - 70)',
        description: 'Hội thoại đời sống, luyện nghe',
        icon: 'chat',
        dayRange: [41, 70],
        status: 'coming_soon',
      },
      {
        id: 4,
        title: 'Giai đoạn 4',
        subtitle: 'Ôn tập & Thi thử (Ngày 71 - 90)',
        description: 'Tổng hợp, đề thi JLPT N5',
        icon: 'trophy',
        dayRange: [71, 90],
        status: 'coming_soon',
      },
    ];

    // Build the 90 days array
    const days = [];
    const lessonMap = {};
    for (const l of lessons) {
      lessonMap[l.day_number] = l;
    }

    for (let day = 1; day <= 90; day++) {
      const lesson = lessonMap[day];
      if (lesson) {
        let status = 'locked';
        let progressPercent = 0;
        let completedAt = null;

        if (day === 1) {
          status = 'available';
        }

        if (userId && userProgressMap[lesson.id]) {
          status = userProgressMap[lesson.id].status;
          progressPercent = userProgressMap[lesson.id].progress_percent;
          completedAt = userProgressMap[lesson.id].completed_at;
        }

        days.push({
          day,
          hasContent: true,
          lessonId: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          estimatedMinutes: lesson.estimated_minutes,
          passingScore: lesson.passing_score,
          status,
          progressPercent,
          completedAt,
        });
      } else {
        days.push({
          day,
          hasContent: false,
          lessonId: null,
          title: `Ngày ${day}`,
          status: 'coming_soon',
          progressPercent: 0,
          completedAt: null,
        });
      }
    }

    return {
      course,
      stages,
      days,
    };
  },
};
