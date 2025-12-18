# Hướng dẫn chạy dự án trên localhost (Windows)

Tài liệu này giúp bạn chạy cả Backend (API) và Frontend (Vite + React) trên máy local.

## Yêu cầu hệ thống
- Node.js LTS (khuyến nghị 18.x hoặc 20.x)
- Trình quản lý gói: npm (đi kèm Node) hoặc pnpm/yarn

> Lưu ý: Mặc định cấu hình `development` trỏ tới PostgreSQL đang host trên Render. (xem trong config/config.json) 

---

## 1) Backend (apps/backend)

### Bước 1: Cài đặt phụ thuộc
```powershell
cd apps/backend
npm install
```

### Bước 2: Tạo file môi trường `.env`
Tạo file `.env` trong thư mục `apps/backend` với các biến sau (điền giá trị phù hợp):

```dotenv
# Cổng server (mặc định 3000)
PORT=3000

# Chế độ môi trường: development | test | production
# Nếu dùng DB local, nên để NODE_ENV=test để tắt SSL mặc định
NODE_ENV=development

# OpenAI (bắt buộc cho các tính năng AI/TTS/STT)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
# Tùy chọn tinh chỉnh
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=512
OPENAI_MAX_TOKENS_TITLE=64

# Tuỳ chọn giọng đọc cho TTS
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_VOICE_DEFAULT=alloy
OPENAI_VOICE_EN=alloy
OPENAI_VOICE_VI=alloy

# Nếu muốn dùng OpenRouter thay cho OpenAI
AI_PROVIDER=openai           # hoặc: openrouter
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_REFERER=
OPENROUTER_TITLE=TiViVu Local

# Giới hạn kích thước body (phục vụ upload audio base64)
JSON_BODY_LIMIT=25mb
URLENCODED_BODY_LIMIT=25mb

# (Tuỳ chọn) Mailjet cho tính năng quên mật khẩu
MAILJET_API_KEY=
MAILJET_API_SECRET=
MAILJET_FROM_EMAIL=no-reply@tivivu.app
MAILJET_FROM_NAME=TiViVu

```

### Bước 3: Cấu hình Database

- Dùng DB local: cài PostgreSQL và tạo DB, rồi cấu hình như sau:
  - Tạo DB `tivivu`.
  - Tạo user và cấp quyền phù hợp.
  - Tạo biến môi trường `DATABASE_URL` theo mẫu:
    - `postgres://<user>:<password>@localhost:5432/<dbname>`
  - Vì cấu hình `development` bật SSL, cách đơn giản nhất là đặt `NODE_ENV=test` trong `.env` để bỏ SSL khi chạy local.
    - Hoặc thêm `?sslmode=disable` vào connection string và đảm bảo không bật `dialectOptions.ssl`.

Ví dụ cho DB local đơn giản:
```dotenv
NODE_ENV=test
DATABASE_URL=postgres://postgres:postgres@localhost:5432/tivivu
```

### Bước 4: Khởi tạo/sync schema
Dự án dùng `sequelize.sync({ alter: true })` để tự tạo/cập nhật bảng tối thiểu.
```powershell
# Thực hiện đồng bộ schema
npm run db:sync
```

> Tuỳ chọn seed data: Thư mục `src/seeders/initall.js` có kịch bản seed, nhưng chưa có lệnh CLI sẵn. Bạn có thể tạo script riêng để gọi thủ tục `up()` nếu cần.

### Bước 5: Chạy server
```powershell
npm start
```
Kiểm tra:
- API health: http://localhost:3000/status
- Tài liệu Swagger: http://localhost:3000/api-docs

---

## 2) Frontend (apps/frontend)

### Bước 1: Cài đặt phụ thuộc
```powershell
cd ../frontend
npm install
```

### Bước 2: Cấu hình API base URL
Tạo file `.env.local` trong thư mục `apps/frontend`:
```dotenv
VITE_API_BASE=http://localhost:3000
```

### Bước 3: Chạy chế độ phát triển
```powershell
npm run dev
```
Mặc định Vite chạy tại http://localhost:5173

> Build production: `npm run build` và xem thử bằng `npm run preview`.

---

## 3) Quy trình chạy nhanh (2 cửa sổ terminal)
```powershell
# Cửa sổ 1 – Backend
cd apps/backend
npm install
npm run db:sync
npm start

# Cửa sổ 2 – Frontend
cd apps/frontend
npm install
# Nếu chưa tạo .env.local thì tạo trước
npm run dev
```
---

## 5) Tài nguyên
- Swagger API: http://localhost:3000/api-docs
- Cấu hình DB: apps/backend/src/config/config.json
- Điểm gọi API ở frontend: apps/frontend/src/services/api.jsx (đọc `VITE_API_BASE`)

