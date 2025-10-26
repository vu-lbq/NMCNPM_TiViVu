# Mô hình Use Case — Ứng dụng học tiếng Anh tương tác

Đây là mô hình use case được đề xuất từ đặc tả yêu cầu, đồng thời bổ sung một số tính năng thực tế nhằm cải thiện trải nghiệm người dùng (UX) và hiệu quả học tập.

## Phạm vi và tác nhân

- Tác nhân chính: Người học (Người dùng)
- Tác nhân phụ (hệ thống bên ngoài):
  - Dịch vụ STT (Speech-to-Text) - OpenAI Whisper
  - Dịch vụ TTS (Text-to-Speech) - OpenAI TTS
  - Dịch vụ LLM (ví dụ GPT hoặc tương tự) - OpenAI GPT-4o
  - Dịch vụ Từ điển/Phát âm - DictionaryAPI.dev
  - Dịch vụ Dịch thuật - Google Cloud Translation v3 hoặc LLM
- Tác nhân tùy chọn: Quản trị viên (Admin)

## Các use case chính (Người dùng)

- Đăng ký / Đăng nhập / Đăng xuất
- Quản lý hồ sơ (tên, email, cấp độ, tuỳ chọn)
- Bắt đầu một phiên hội thoại
- Thu âm giọng nói
- Chuyển giọng nói thành văn bản (STT)
- Chỉnh sửa bản chép lời (tùy chọn)
- Gửi tin nhắn
- Nhận phản hồi từ LLM (theo ngữ cảnh)
- Nhận gợi ý câu hỏi tiếp theo
- Phát phản hồi bằng TTS
- Nhấn vào từ để xem nghĩa/ phát âm
- Dịch văn bản được chọn
- Lưu từ vào sổ tay cá nhân
- Ôn tập từ vựng (flashcards/quiz)
- Xem lại lịch sử hội thoại
- Cài đặt (chọn STT/TTS, giọng, tốc độ, quyền riêng tư)
- Gửi phản hồi / Báo lỗi

## Quản trị viên (tùy chọn)

- Quản lý gợi ý/mẫu hội thoại (prompts/templates)
- Theo dõi thống kê/analytics
- Quản lý người dùng (vai trò, khóa tài khoản)
- Quản lý nội dung/từ vựng/từ điển

## Sơ đồ Use Case (PlantUML)

```plantuml
@startuml
left to right direction
actor "Người học" as User
actor "Quản trị viên" as Admin
actor "Dịch vụ STT" as STT
actor "Dịch vụ TTS" as TTS
actor "Dịch vụ LLM" as LLM
actor "Dịch vụ Từ điển" as Dict
actor "Dịch vụ Dịch thuật" as Trans

rectangle "Ứng dụng học tiếng Anh" as System {
  (Đăng ký)
  (Đăng nhập)
  (Đăng xuất)
  (Quản lý hồ sơ)
  (Bắt đầu hội thoại)
  (Thu âm giọng nói)
  (Chuyển giọng nói thành văn bản)
  (Chỉnh sửa bản chép lời)
  (Gửi tin nhắn)
  (Nhận phản hồi LLM)
  (Gợi ý câu hỏi tiếp theo)
  (Phát phản hồi bằng TTS)
  (Tổng hợp giọng nói TTS)
  (Nhấn vào từ)
  (Xem nghĩa / phát âm)
  (Dịch văn bản)
  (Lưu từ)
  (Ôn tập từ vựng)
  (Xem lịch sử hội thoại)
  (Cài đặt)
  (Gửi phản hồi / Báo lỗi)

  (Quản lý gợi ý / mẫu hội thoại)
  (Theo dõi thống kê / sử dụng)
  (Quản lý người dùng)
  (Quản lý nội dung / từ vựng)
}

' Liên kết của Người dùng
User -- (Đăng ký)
User -- (Đăng nhập)
User -- (Đăng xuất)
User -- (Quản lý hồ sơ)
User -- (Bắt đầu hội thoại)
User -- (Thu âm giọng nói)
User -- (Chỉnh sửa bản chép lời)
User -- (Gửi tin nhắn)
User -- (Phát phản hồi bằng TTS)
User -- (Nhấn vào từ)
User -- (Dịch văn bản)
User -- (Lưu từ)
User -- (Ôn tập từ vựng)
User -- (Xem lịch sử hội thoại)
User -- (Cài đặt)
User -- (Gửi phản hồi / Báo lỗi)

' Liên kết của Quản trị viên
Admin -- (Quản lý gợi ý / mẫu hội thoại)
Admin -- (Theo dõi thống kê / sử dụng)
Admin -- (Quản lý người dùng)
Admin -- (Quản lý nội dung / từ vựng)

' Liên kết tới dịch vụ bên ngoài
STT -- (Chuyển giọng nói thành văn bản)
TTS -- (Tổng hợp giọng nói TTS)
LLM -- (Nhận phản hồi LLM)
Dict -- (Xem nghĩa / phát âm)
Trans -- (Dịch văn bản)

' include / extend
(Bắt đầu hội thoại) .> (Thu âm giọng nói) : <<include>>
(Thu âm giọng nói) .> (Chuyển giọng nói thành văn bản) : <<include>>
(Chỉnh sửa bản chép lời) .> (Chuyển giọng nói thành văn bản) : <<extend>>
(Gửi tin nhắn) .> (Nhận phản hồi LLM) : <<include>>
(Nhận phản hồi LLM) .> (Gợi ý câu hỏi tiếp theo) : <<include>>
(Phát phản hồi bằng TTS) .> (Tổng hợp giọng nói TTS) : <<include>>

(Nhấn vào từ) .> (Xem nghĩa / phát âm) : <<include>>
(Nhấn vào từ) .> (Dịch văn bản) : <<extend>>
(Lưu từ) .> (Nhấn vào từ) : <<extend>>
(Ôn tập từ vựng) .> (Lưu từ) : <<include>>

(Đăng nhập) .> (Đăng ký) : <<extend>>
(Đăng xuất) .> (Đăng nhập) : <<extend>>
@enduml
```

## Brief flows (EN)

- Start Conversation
  1) User chooses to start; 2) User speaks; 3) STT transcribes; 4) User optionally edits; 5) User sends; 6) System calls LLM; 7) System shows response and suggested follow-ups; 8) User may play TTS.
- Vocabulary Support
  1) User taps a word; 2) System fetches meaning/pronunciation; 3) Optionally translate; 4) User may save to wordbook; 5) Later review via quiz/flashcards.
- History
  1) User opens history; 2) System displays past sessions and messages; 3) User can resume or review.

## Tóm tắt luồng (VI)

- Bắt đầu hội thoại
  1) Người dùng bắt đầu; 2) Nói tiếng Anh; 3) STT chuyển giọng nói → văn bản; 4) Có thể chỉnh sửa; 5) Gửi; 6) Hệ thống gọi LLM; 7) Hiển thị trả lời và gợi ý câu hỏi tiếp theo; 8) Có thể nghe TTS.
- Hỗ trợ từ vựng
  1) Nhấn vào từ; 2) Hệ thống trả về nghĩa/cách phát âm; 3) Tuỳ chọn dịch; 4) Lưu vào sổ từ; 5) Ôn tập sau qua quiz/flashcards.
- Lịch sử
  1) Mở lịch sử; 2) Xem lại phiên trước; 3) Tiếp tục hoặc xem lại.

## Preconditions / Postconditions (ví dụ)

- Gửi tin nhắn
  - Pre: Người dùng đã xác thực (hoặc cho phép khách), có văn bản từ STT hoặc nhập thủ công.
  - Post: Phản hồi LLM được lưu vào phiên; có gợi ý câu hỏi; TTS sẵn sàng (nếu chọn).
- Lưu từ vựng
  - Pre: Đã chọn một từ (từ phản hồi hoặc bản hội thoại).
  - Post: Từ được lưu vào sổ tay; xuất hiện trong phần Ôn tập từ vựng.

## Ghi chú

- Mục Cài đặt nên cho phép chọn nhà cung cấp (STT/TTS/LLM), giọng đọc, tốc độ nói và quyền riêng tư.
- Lưu ý độ trễ để trải nghiệm mượt: STT < 1–2s, LLM < 2–4s, TTS < 1–2s.
- Có phương án dự phòng: cho phép nhập văn bản nếu mic/STT lỗi; hiển thị văn bản nếu TTS lỗi.
