-- Migration 001: Initial Schema for Nihongo N5 E-Learning

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50) DEFAULT 'N5',
  total_days INT DEFAULT 90,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL,
  day_number INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  estimated_minutes INT DEFAULT 60,
  passing_score INT DEFAULT 8,
  prerequisite_lesson_id VARCHAR(50) DEFAULT NULL,
  learning_objectives_json JSON DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL,
  section_key VARCHAR(50) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_json JSON DEFAULT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_lesson_section (lesson_id, section_key)
);

CREATE TABLE IF NOT EXISTS hiragana_characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL,
  character_text VARCHAR(10) NOT NULL,
  romaji VARCHAR(20) NOT NULL,
  pronunciation_note TEXT,
  writing_practice_count INT DEFAULT 10,
  display_order INT DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_hiragana_lesson (lesson_id)
);

CREATE TABLE IF NOT EXISTS vocabulary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL,
  japanese VARCHAR(255) NOT NULL,
  romaji VARCHAR(255) NOT NULL,
  meaning_vi VARCHAR(255) NOT NULL,
  example_sentence TEXT,
  audio_url VARCHAR(500) DEFAULT NULL,
  is_preview BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_vocab_lesson (lesson_id)
);

CREATE TABLE IF NOT EXISTS conversation_examples (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL,
  japanese TEXT NOT NULL,
  romaji TEXT NOT NULL,
  translation_vi TEXT NOT NULL,
  explanation TEXT,
  display_order INT DEFAULT 0,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_convo_lesson (lesson_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(50) PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  passing_score INT NOT NULL,
  max_score INT NOT NULL,
  total_questions INT NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(50) PRIMARY KEY,
  quiz_id VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  explanation TEXT,
  display_order INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_qq_quiz (quiz_id)
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id VARCHAR(50) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  INDEX idx_qo_question (question_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  quiz_id VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  passing_score INT NOT NULL,
  is_passed BOOLEAN NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_qa_user (user_id, quiz_id)
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id VARCHAR(50) NOT NULL,
  selected_option_id INT DEFAULT NULL,
  selected_text TEXT DEFAULT NULL,
  is_correct BOOLEAN NOT NULL,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  lesson_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'locked',
  progress_percent INT DEFAULT 0,
  completed_at DATETIME DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_lesson (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS user_section_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  lesson_id VARCHAR(50) NOT NULL,
  section_key VARCHAR(50) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_section (user_id, lesson_id, section_key)
);

CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  vocabulary_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'learning',
  review_count INT DEFAULT 0,
  last_reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_vocab (user_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS user_study_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  activity_date DATE NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  xp_earned INT DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_activity (user_id, activity_date)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rt_user (user_id)
);
