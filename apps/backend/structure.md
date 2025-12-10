# Backend Structure Overview

This document maps common tasks to the exact files and modules in the backend. It’s a quick reference for answering “xử lý nằm ở đâu?” fast.

## Entry Points

- `apps/backend/server.js`: Loads `.env`, syncs DB, starts HTTP server (reads `PORT`).
- `apps/backend/src/app.js`: Registers middleware (CORS, morgan, body limits), mounts `mainRouter`, and the global error handler.

## Routers

- `src/routes/mainRouter.js` (hub)
  - `GET /status` → inline status
  - Root redirect: `GET /` → `/login`
  - Auth pages: `GET /login` → `controllers/controller.js`
  - Auth API:
    - `POST /login` → `controllers/authController.postLogin`
    - `POST /register` → `controllers/authController.postRegister`
    - `GET /me` (JWT) → `middlewares/auth.authenticate` → `authController.getMe`
  - Password reset:
    - `POST /auth/forgot-password` → `controllers/passwordController.forgotPassword` → `services/mailService.sendForgotPasswordMail` + `utils/resetToken`
    - `GET /auth/reset` → `controllers/passwordController.showReset` (validate token)
    - `POST /auth/reset` → `controllers/passwordController.resetPassword`
  - Feedback (anonymous allowed):
    - `POST /feedback` → `controllers/feedbackController.create`
  - Admin (protected + admin-only):
    - `GET /admin/stats` → `controllers/adminController.stats`
    - `GET /admin/users` → `controllers/adminController.listUsers`
    - `POST /admin/users` → `controllers/adminController.createUser`
    - `DELETE /admin/users/:id` → `controllers/adminController.deleteUser`
    - `POST /admin/users/:id/toggle-role` → `controllers/adminController.toggleRole`
    - `GET /admin/feedback` → `controllers/adminController.listFeedback`
    - `DELETE /admin/feedback/:id` → `controllers/adminController.deleteFeedback`
  - Conversations + Messages (protected):
    - `router.use('/conversations', conversationRouter)` → see below
  - AI Test (dev): `GET /ai/test` → `controllers/aiController.test`
  - TTS/STT/Voice (protected):
    - `POST /tts` → `controllers/voiceController.textToSpeech`
    - `POST /stt` → `controllers/voiceController.speechToText`
    - `POST /voice-chat` → `controllers/voiceController.voiceChat`
  - NLP/Dictionary (protected):
    - `POST /translate` → `controllers/nlpController.translateText`
    - `GET /vocab/define` → `controllers/nlpController.defineWord`
  - Vocabulary (protected):
    - `GET /vocab` → `controllers/vocabController.listVocab`
    - `POST /vocab` → `controllers/vocabController.addVocab`
    - `DELETE /vocab/:id` → `controllers/vocabController.removeVocab`

- `src/routes/conversationRouter.js` (all protected by `authenticate`)
  - `GET /conversations` → `conversationController.listConversations`
  - `POST /conversations` → `conversationController.createConversation`
  - `GET /conversations/:id` → `conversationController.getConversation`
  - `DELETE /conversations/:id` → `conversationController.deleteConversation`
  - `DELETE /conversations/cleanup-empty` → `conversationController.cleanupEmptyConversations`
  - Messages under a conversation:
    - `GET /conversations/:id/messages` → `messageController.listMessages`
    - `POST /conversations/:id/messages` → `messageController.postMessage`

## Controllers

- `controllers/authController.js`: Register/Login/JWT me.
- `controllers/passwordController.js`: Forgot/reset password flow; uses `utils/resetToken` and `services/mailService`.
- `controllers/feedbackController.js`: Create feedback (anon or authenticated).
- `controllers/adminController.js`: Admin stats, user CRUD, feedback moderation.
- `controllers/conversationController.js`: CRUD conversations, cleanup empty.
- `controllers/messageController.js`: List/post messages; calls `services/aiService.generateAssistantReply` and `generateConversationTitle`.
- `controllers/voiceController.js`: TTS, STT, and `/voice-chat` pipeline (STT → LLM → TTS).
- `controllers/nlpController.js`: Translate and dictionary lookup (dictionaryapi.dev) + short VN meanings via `aiService.simplePrompt`.

## Services

- `services/aiService.js`:
  - `getClient()` OpenAI client.
  - `generateAssistantReply(conversationId, userContent, { extraSystemPrompt?, maxTokens? })`
  - `simplePrompt(prompt)` one-shot.
  - `generateConversationTitle(conversationId)`.
  - Honors env: `AI_PROVIDER` (`openai`/`openrouter`), `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TEMPERATURE`, `OPENAI_MAX_TOKENS`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, etc.
- `services/ttsService.js`: Text → speech. Used by `/tts` and `/voice-chat`.
- `services/sttService.js`: Speech → text. Used by `/stt` and `/voice-chat`.
- `services/mailService.js`: Mailjet; env `MAILJET_API_KEY`, `MAILJET_API_SECRET`, `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`.

## Middleware & Utils

- `middlewares/auth.js`:
  - `authenticate` (JWT Bearer) sets `req.user`.
  - `ensureAdmin` guards admin endpoints.
- `middlewares/errorHandler.js`: Global error handler used in `app.js`.
- `utils/resetToken.js`: Password reset token sign/verify (uses `RESET_JWT_SECRET` or `JWT_SECRET`).

## Models

- `src/models/` — Sequelize models (User, Conversation, Message, Vocabulary, Feedback).
- `src/dbInit.js` — Sync DB on boot.

## Voice Chat Flow (high level)

1. Client uploads mic audio → `POST /voice-chat`.
2. `voiceController.voiceChat` writes temp file → `sttService.transcribe` (OpenAI Whisper).
3. Saves user message → calls `aiService.generateAssistantReply` with concise “voice mode” prompt and `VOICECHAT_MAX_TOKENS`.
4. Saves assistant message → TTS via `ttsService.synthesize` → returns audio + transcript.

## Hands-free Mode Example (frontend ↔ backend)

- Frontend (`apps/frontend/src/components/VoiceChatModal.jsx`):
  - Starts recording; shows status: `Recording... Tap to stop (or pause 5s)`.
  - Uses Web Audio `AnalyserNode` to detect silence; stops automatically after 5 seconds of continuous silence (`SILENCE_MS = 5000`).
  - Uploads audio base64 to backend: `POST /voice-chat` with `conversationId` (if present).
  - Plays AI TTS reply; when hands-free is ON, auto-restarts recording 1 second after playback ends. When OFF, shows a short "Ready to record" toast after 1 second.

- Backend (`/voice-chat` in `controllers/voiceController.js`):
  - Accepts `audioBase64`, writes temp file, runs STT via `services/sttService.transcribe`.
  - Persists the user transcript as a `Message`, resolves/creates `Conversation` for the user.
  - Calls `services/aiService.generateAssistantReply` with an extra system prompt: “Voice mode: Answer in ≤3 sentences…”. Reply length is controlled by `VOICECHAT_MAX_TOKENS` (e.g., 192 by default; increase to 512–768 for longer audio).
  - Persists assistant `Message`, optional title update.
  - Runs TTS via `services/ttsService.synthesize`, returns `{ transcript, replyText, audioBase64, contentType, conversationId }`.

- Config knobs affecting flow:
  - `.env` (backend): `VOICECHAT_MAX_TOKENS` limits reply length; `OPENAI_TEMPERATURE` adjusts verbosity/creativity; `OPENAI_MODEL` selects model (defaults to `gpt-4o-mini`).
  - Frontend hands-free timing: 5s silence to stop; 1s delay before auto-restart or before showing the “Ready to record” toast.

## Environment Variables (selection)

- Core: `PORT`, `JWT_SECRET`, `RESET_JWT_SECRET` (optional), `CORS_ORIGIN`.
- AI: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TEMPERATURE`, `OPENAI_MAX_TOKENS`, `VOICECHAT_MAX_TOKENS`, `AI_PROVIDER`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.
- Mail: `MAILJET_API_KEY`, `MAILJET_API_SECRET`, `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`.
- Limits: `JSON_BODY_LIMIT`, `URLENCODED_BODY_LIMIT`.

## Quick Pointers

- Where to change default model/temperature/tokens: `services/aiService.js` or `.env`.
- Where to adjust voice chat length: `.env` → `VOICECHAT_MAX_TOKENS`.
- Where to adjust password reset email: `services/mailService.js`.
- Where to change auth logic: `middlewares/auth.js` & `controllers/authController.js`.
- Where vocabulary is saved: `controllers/vocabController.js`.
