# 🌸 Nihongo N5 — Nền Tảng Học Tiếng Nhật N5 Trực Tuyến

> **Website học tiếng Nhật chuẩn JLPT N5 dành cho người mới bắt đầu** theo phong cách thiết kế **Japanese Sakura E-learning Dashboard**.
> Tích hợp đầy đủ Frontend, Backend, Database MySQL 8+, Docker Compose, cơ chế xác thực JWT an toàn, quản lý tiến độ học tập và chấm điểm trắc nghiệm thời gian thực.

---

## 📸 1. Tổng Quan Giao Diện & Thiết Kế

Giao diện được thiết kế bám sát phong cách **Japanese Sakura Dashboard**:
- **Bảng màu chủ đạo:**
  - Primary Pink: `#EC4899`
  - Light Pink / Sakura Accent: `#FCE7F3`
  - Background: `#FFF9FC`
  - Navy Dark: `#172554`
  - Sky Pastel: `#DBEAFE`
  - Success Green: `#10B981`
- **Yếu tố đồ họa văn hóa Nhật Bản:** Núi Phú Sĩ tuyết phủ, Cổng Torii thần đạo, Chùa đỏ năm tầng, Mèo may mắn Maneki-neko vẫy tay, và nhân vật nữ sinh Kimono Chibi mascot.
- **Typography:**
  - Tiếng Việt & Tiếng Anh: *Be Vietnam Pro* & *Inter*
  - Tiếng Nhật: *Noto Sans JP*

---

## 🛠️ 2. Tech Stack

### Frontend
- **Framework:** React 19 + Vite 6
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS 3.4
- **State Management:** Zustand + TanStack Query v5
- **Animations:** Framer Motion (hiệu ứng 3D Flashcard, tab transitions)
- **Data Visualization:** Recharts (Biểu đồ hoạt động và XP học tập)
- **Forms & Validation:** React Hook Form + Zod
- **Audio & TTS:** Web Speech API với giọng phát âm tiếng Nhật `ja-JP` chuẩn bản xứ
- **Icons & Alerts:** Lucide React, Sonner Toast, Canvas Confetti

### Backend
- **Runtime:** Node.js (v20+ / LTS)
- **Framework:** ExpressJS (ES Modules)
- **Database Driver:** `mysql2/promise` (Connection Pool, Prepared Statements, Transactions)
- **Bảo mật:** JWT Authentication (Access Token 15m, Refresh Token Rotation 7d), bcryptjs, Helmet, CORS, Express Rate Limit
- **Data Validation:** Zod Schema Validation
- **Database Abstraction:** Hỗ trợ chuẩn MySQL 8+ kèm adapter SQLite WASM thông minh cho môi trường phát triển độc lập không cần cấu hình phức tạp.

### Database
- **Hệ quản trị:** MySQL 8+
- **Migrations:** SQL DDL với Foreign Keys, Indexes, Cascades.
- **Seeding:** Script import tự động phân tích dữ liệu từ `data/japanese_n5_days_01_05.json`.

---

## 📁 3. Cấu Trúc Thư Mục

```text
nihongo-n5/
├── client/                      # Ứng dụng Frontend React 19 + Vite
│   ├── public/
│   │   └── assets/              # SVG minh họa (Torii, Fuji, Maneki-neko, Chibi girl)
│   ├── src/
│   │   ├── api/                 # Axios client & interceptors auto-refresh token
│   │   ├── components/
│   │   │   ├── layout/          # Header, Sidebar, Footer, AppLayout
│   │   │   ├── learning/        # Tab bài học, Bảng chữ cái, Mẫu câu
│   │   │   ├── flashcards/      # Thẻ lật 3D Flashcard
│   │   │   └── quiz/            # Giao diện thi trắc nghiệm
│   │   ├── pages/               # HomePage, RoadmapPage, LessonPage, FlashcardsPage, QuizPage, ProgressPage, LoginPage, RegisterPage
│   │   ├── stores/              # Zustand Auth Store
│   │   ├── utils/               # Audio TTS, ngày tháng
│   │   ├── styles/              # Tailwind directives & CSS 3D flip
│   │   ├── App.jsx              # Routing configuration
│   │   └── main.jsx             # React entry point & QueryClientProvider
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Ứng dụng Backend Express REST API
│   ├── src/
│   │   ├── config/              # Database pool, environment config
│   │   ├── controllers/         # Auth, Course, Lesson, Quiz, Progress, Flashcard
│   │   ├── services/            # Business logic, Token rotation, Scoring
│   │   ├── repositories/        # SQL queries, Transactions, Data access
│   │   ├── routes/              # Express API routers
│   │   ├── middleware/          # JWT verify, Rate limiter, Error handler
│   │   ├── validators/          # Zod schemas
│   │   ├── utils/               # Token helpers, response formatters
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP server launcher & graceful shutdown
│   ├── database/
│   │   ├── migrations/          # 001_initial_schema.sql & migration runner
│   │   ├── seeds/               # Seed scripts
│   │   └── importLessons.js     # Script import dữ liệu từ JSON vào Database
│   ├── .env.example
│   └── package.json
│
├── data/
│   └── japanese_n5_days_01_05.json # Dữ liệu bài học chuẩn 5 ngày đầu
├── docker-compose.yml           # MySQL 8.0 container service
├── package.json                 # Quản lý workspaces & root scripts
└── README.md                    # Tài liệu dự án
```

---

## 🚀 4. Hướng Dẫn Cài Đặt & Khởi Chạy

### Cách 1: Khởi chạy nhanh (Đầy đủ Backend, Frontend & DB tự động)

1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

2. Chạy migration và seed dữ liệu từ file JSON vào database:
```bash
npm run db:migrate
npm run db:seed
```

3. Khởi chạy đồng thời cả Frontend và Backend:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Healthcheck:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Cách 2: Triển khai với Docker Compose (MySQL 8.0)

1. Khởi động container MySQL 8.0:
```bash
docker compose up -d
```

2. Kiểm tra container đang chạy:
```bash
docker ps
```

3. Chạy migration và import bài học vào MySQL:
```bash
npm run db:migrate
npm run db:seed
```

4. Khởi chạy ứng dụng:
```bash
npm run dev
```

---

## 📡 5. Danh Sách REST API

Tất cả các API đều có tiền tố `/api`.

| Nhóm | Phương thức | Endpoint | Mô tả | Yêu cầu xác thực |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản học viên mới | Không |
| | `POST` | `/api/auth/login` | Đăng nhập tài khoản, trả về JWT token | Không |
| | `POST` | `/api/auth/refresh` | Làm mới access token bằng refresh token | Cookie / Body |
| | `POST` | `/api/auth/logout` | Đăng xuất, hủy bỏ token | Không |
| | `GET` | `/api/auth/me` | Lấy thông tin người dùng hiện tại | Bearer Token |
| | `PUT` | `/api/auth/profile` | Cập nhật họ tên, ảnh đại diện | Bearer Token |
| **Courses** | `GET` | `/api/courses` | Lấy danh sách khóa học | Không |
| | `GET` | `/api/courses/:id` | Lấy chi tiết khóa học | Không |
| | `GET` | `/api/courses/:id/roadmap` | Lấy lộ trình 4 giai đoạn & 90 ngày học | Tùy chọn |
| **Lessons** | `GET` | `/api/lessons` | Lấy toàn bộ 5 bài học kèm trạng thái mở khóa | Tùy chọn |
| | `GET` | `/api/lessons/day/:day` | Chi tiết bài học theo ngày (1 đến 5) | Tùy chọn |
| | `GET` | `/api/lessons/:id/vocabulary` | Danh sách từ vựng kèm trạng thái ôn tập | Tùy chọn |
| | `GET` | `/api/lessons/:id/conversations` | Danh sách mẫu câu giao tiếp | Không |
| **Quiz** | `GET` | `/api/quizzes/lesson/:lessonId` | Lấy đề thi kiểm tra (Bảo mật: Đã ẩn đáp án đúng) | Không |
| | `POST` | `/api/quizzes/:quizId/submit` | Nộp bài kiểm tra, Backend chấm điểm và tự động mở khóa bài học tiếp theo | Bearer Token |
| | `GET` | `/api/quizzes/:quizId/history` | Xem lịch sử các lần thi | Bearer Token |
| **Progress** | `GET` | `/api/progress/dashboard` | Lấy thống kê trang chủ (chuỗi ngày, %, bài học) | Bearer Token |
| | `GET` | `/api/progress/lessons` | Danh sách tiến độ tất cả bài học | Bearer Token |
| | `PUT` | `/api/progress/sections/:sectionId` | Đánh dấu hoàn thành phần học (Học bài, Bài tập) | Bearer Token |
| | `GET` | `/api/progress/statistics` | Thống kê điểm XP và ngày học dạng lịch | Bearer Token |
| **Flashcards** | `GET` | `/api/flashcards` | Danh sách thẻ Flashcard (lọc theo ngày, trạng thái) | Tùy chọn |
| | `PUT` | `/api/flashcards/:id/progress` | Đánh dấu "Đã nhớ" hoặc "Chưa nhớ" | Bearer Token |

---

## 🧪 6. Kiểm Thử (Testing)

Dự án có đầy đủ bộ kiểm thử tự động cho cả Backend và Frontend:

### Chạy toàn bộ test
```bash
npm run test
```

### Chạy test Backend (Vitest + Supertest)
```bash
npm run test --workspace=server
```
Bao gồm:
- Xác thực đăng ký, đăng nhập, bảo vệ route với JWT token.
- Phân phối bài học từ cơ sở dữ liệu.
- Cơ chế chống gian lận: API đề thi dành cho học viên không chứa trường đáp án đúng.
- Backend chấm điểm chính xác theo cấu hình bài học (`passingScore`).
- Tự động hoàn thành bài học và mở khóa Ngày tiếp theo.
- Tính toán chuỗi ngày học liên tục (streak) và lưu lịch sử.

### Chạy test Frontend (Vitest + React Testing Library)
```bash
npm run test:client
```
Bao gồm:
- Render Header, Navigation pills, Logo Torii và huy hiệu chuỗi ngày học.
- Render Sidebar và đầy đủ các mục điều hướng chức năng.
- Chuyển đổi trạng thái thẻ flashcard và routing.

---

## 🔒 7. Tính Năng Bảo Mật & Tối Ưu Hóa

1. **Chấm điểm độc quyền tại Backend:** Học viên không thể xem trước đáp án đúng qua network inspector hay tự giả mạo kết quả để mở khóa bài học.
2. **Bảo mật JWT:** Access Token ngắn hạn (15 phút) và Refresh Token có cơ chế xoay vòng (Token Rotation) nhằm chống lại tấn công Replay Attack.
3. **Mã hóa mật khẩu:** Sử dụng `bcryptjs` với salt 10 rounds.
4. **Phát âm chuẩn Web Speech API:** Hỗ trợ đọc tự nhiên các ký tự Hiragana, từ vựng và câu đàm thoại tiếng Nhật.
5. **Idempotent Data Import:** Chạy script import nhiều lần an toàn, không gây trùng lặp dữ liệu và bảo toàn tiến độ đã có của người học.

---

Chúc bạn có một trải nghiệm học tập tiếng Nhật thú vị cùng **Nihongo N5**! 🌸🎌
