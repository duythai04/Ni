import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { runMigrations } from '../../database/migrations/runMigrations.js';
import { importLessons } from '../../database/importLessons.js';

describe('Nihongo N5 Backend API Integration Tests', () => {
  let authToken = null;
  let testUserId = null;
  const testUser = {
    full_name: 'Yamada Taro',
    email: `taro_${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    // Ensure migrations and seeded lessons are in place
    await runMigrations();
    await importLessons();
  });

  describe('Healthcheck', () => {
    it('GET /api/health returns ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication API', () => {
    it('POST /api/auth/register creates user and returns tokens', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();

      authToken = res.body.data.accessToken;
      testUserId = res.body.data.user.id;
    });

    it('POST /api/auth/login logs in user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('GET /api/auth/me returns current user profile with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testUserId);
      expect(res.body.data.full_name).toBe(testUser.full_name);
    });

    it('GET /api/auth/me rejects invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_xyz');

      expect(res.status).toBe(401);
    });
  });

  describe('Courses & Roadmap API', () => {
    it('GET /api/courses returns course list', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/courses/:id/roadmap returns 4 stages and 90 planned days', async () => {
      const res = await request(app).get('/api/courses/japanese-n5-beginner/roadmap');
      expect(res.status).toBe(200);
      expect(res.body.data.stages.length).toBe(4);
      expect(res.body.data.days.length).toBe(90);
      // Day 1 has content
      expect(res.body.data.days[0].hasContent).toBe(true);
      expect(res.body.data.days[0].day).toBe(1);
      // Day 6 is coming soon
      expect(res.body.data.days[5].hasContent).toBe(false);
      expect(res.body.data.days[5].status).toBe('coming_soon');
    });
  });

  describe('Lessons API', () => {
    it('GET /api/lessons returns all 5 seeded lessons', async () => {
      const res = await request(app).get('/api/lessons');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5);
      expect(res.body.data[0].day_number).toBe(1);
      expect(res.body.data[4].day_number).toBe(5);
    });

    it('GET /api/lessons/day/1 returns Day 1 with alphabet, vocab, and convos', async () => {
      const res = await request(app).get('/api/lessons/day/1');
      expect(res.status).toBe(200);
      const lesson = res.body.data;
      expect(lesson.day_number).toBe(1);
      expect(lesson.title).toContain('Nguyên âm Hiragana');
      expect(lesson.characters.length).toBe(5); // あ, い, う, え, お
      expect(lesson.vocabulary.length).toBe(6);
      expect(lesson.conversations.length).toBe(3);
    });

    it('GET /api/lessons/day/99 returns 404', async () => {
      const res = await request(app).get('/api/lessons/day/99');
      expect(res.status).toBe(404);
    });
  });

  describe('Quiz Security & Submission API', () => {
    it('GET /api/quizzes/lesson/:lessonId strips is_correct for students', async () => {
      const res = await request(app).get('/api/quizzes/lesson/jlpt-n5-day-01');
      expect(res.status).toBe(200);
      const quiz = res.body.data;
      expect(quiz.id).toBe('day-1-quiz');
      expect(quiz.passingScore).toBe(8);
      expect(quiz.questions.length).toBe(14);

      // Verify NO is_correct field is leaked
      for (const q of quiz.questions) {
        expect(q.correctAnswer).toBeUndefined();
        for (const opt of q.options) {
          expect(opt.is_correct).toBeUndefined();
          expect(opt.isCorrect).toBeUndefined();
        }
      }
    });

    it('POST /api/quizzes/:quizId/submit scores correctly and unlocks Day 2 when passed', async () => {
      // Day 1 correct answers:
      // d1-q01: a, d1-q02: i, d1-q03: u, d1-q04: e, d1-q05: o
      // d1-q06: Tình yêu, d1-q07: Màu xanh dương, d1-q08: Ngôi nhà, d1-q09: Phía trên
      const validAnswers = {
        'd1-q01': 'a',
        'd1-q02': 'i',
        'd1-q03': 'u',
        'd1-q04': 'e',
        'd1-q05': 'o',
        'd1-q06': 'Tình yêu',
        'd1-q07': 'Màu xanh dương',
        'd1-q08': 'Ngôi nhà',
        'd1-q09': 'Phía trên',
      };

      const res = await request(app)
        .post('/api/quizzes/day-1-quiz/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers: validAnswers });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBeGreaterThanOrEqual(8);
      expect(res.body.data.isPassed).toBe(true);
      expect(res.body.data.nextLessonUnlocked).toBeDefined();
      expect(res.body.data.nextLessonUnlocked.day_number).toBe(2);

      // Check roadmap now shows Day 2 as available!
      const roadmapRes = await request(app)
        .get('/api/courses/japanese-n5-beginner/roadmap')
        .set('Authorization', `Bearer ${authToken}`);

      expect(roadmapRes.body.data.days[0].status).toBe('completed');
      expect(roadmapRes.body.data.days[1].status).toBe('available');
    });
  });

  describe('Progress & Dashboard API', () => {
    it('GET /api/progress/dashboard returns personalized stats', async () => {
      const res = await request(app)
        .get('/api/progress/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const dash = res.body.data;
      expect(dash.completedDays).toBeGreaterThanOrEqual(1);
      expect(dash.studyStreak).toBeGreaterThanOrEqual(1);
      expect(dash.recentQuiz).toBeDefined();
      expect(dash.recentQuiz.is_passed).toBe(1);
    });
  });

  describe('Flashcards API', () => {
    it('GET /api/flashcards returns list with filters', async () => {
      const res = await request(app)
        .get('/api/flashcards?day=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(6);
      expect(res.body.data[0].japanese).toBe('あい');
    });

    it('PUT /api/flashcards/:id/progress updates remembered state', async () => {
      const listRes = await request(app)
        .get('/api/flashcards?day=1')
        .set('Authorization', `Bearer ${authToken}`);
      const targetId = listRes.body.data[0].id;

      const res = await request(app)
        .put(`/api/flashcards/${targetId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'remembered' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('remembered');
    });
  });
});
