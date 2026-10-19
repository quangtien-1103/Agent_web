# English Web

Website học tiếng Anh theo ngữ cảnh: tra từ vựng, xem giải thích ngữ pháp, luyện đọc và thực hành hội thoại. Giao diện chạy bằng HTML/CSS/JavaScript thuần; máy chủ Node.js giữ API key và gọi nhà cung cấp AI.

## Yêu cầu

- Node.js 18 trở lên
- API key cho nhà cung cấp bạn chọn (Gemini được cấu hình mặc định)

## Chạy ứng dụng

1. Sao chép `server/.env.example` thành `server/.env`.
2. Thêm API key Gemini vào `GEMINI_API_KEY` trong `server/.env`.
3. Tại thư mục gốc, chạy:

   ```sh
   npm start
   ```

4. Mở <http://127.0.0.1:3000>.

Không mở trực tiếp các file HTML bằng `file://`: trình duyệt cần máy chủ để gọi API.

## Đổi nhà cung cấp AI

API key chỉ được đọc ở backend, không nhúng vào mã trình duyệt. Trong `server/.env`, đặt `AI_PROVIDER` là `gemini`, `groq` hoặc `claude`, rồi cung cấp biến khóa tương ứng (`GEMINI_API_KEY`, `GROQ_API_KEY` hoặc `ANTHROPIC_API_KEY`). Tùy chọn `AI_MODEL` ghi đè model mặc định của provider.

## Triển khai lên Vercel

Website đã có Vercel Serverless Function tại [api/vocabulary.js](./api/vocabulary.js). Khi triển khai repository lên Vercel:

1. Chọn thư mục gốc `D:\agent_english` làm Root Directory.
2. Không đưa `server/.env` lên GitHub.
3. Trong Vercel Project Settings → Environment Variables, thêm `GEMINI_API_KEY`.
4. Có thể thêm `AI_MODEL` để chọn model Gemini.
5. Deploy lại project.

Frontend vẫn gọi `POST /api/vocabulary`; Vercel tự ánh xạ request này tới `api/vocabulary.js`. Local development vẫn dùng endpoint tương ứng trong `server/server.js`.

## Tính năng

- Trang chủ hiển thị tiến độ, chuỗi ngày học và từ vừa tra.
- Tra từ, phát âm qua giọng nói của trình duyệt và lưu/ôn từ trên thiết bị.
- Tra cấu trúc ngữ pháp, làm mini quiz và kiểm tra câu.
- Tạo bài đọc theo trình độ/chủ đề; bấm từ trong bài để tra nghĩa.
- Thực hành hội thoại bằng cách gõ hoặc nói tiếng Anh; nút microphone sẽ xin quyền thu âm trước khi nhận diện.
- Phát âm từ vựng bằng giọng đọc tiếng Anh `en-US` trên các thẻ từ.
- Khóa học **English 1** gồm 12 tuần: roadmap theo chủ đề, lịch học 7 ngày, tiến độ từng ngày và tạo nội dung theo từng lượt A-E của prompt pack.
- Chế độ tối; sổ từ và tiến độ được lưu trong `localStorage`.

Nếu chưa cấu hình khóa AI, các thao tác cần AI sẽ báo thiếu cấu hình và không trả về nội dung giả.

## English 1

Mở `course.html` để học theo lộ trình:

1. Mỗi tuần có một chủ đề và trình độ tăng dần từ A1 đến B1.
2. Bảy ngày lần lượt đi qua từ vựng, ngữ pháp, reading, listening, ôn tập và nhiệm vụ đầu ra.
3. Đánh dấu từng ngày đã hoàn thành; dữ liệu được lưu trong `localStorage`.
4. Nút **Tạo nội dung tuần** gọi lượt A trước để tạo danh sách từ vựng cho người học duyệt. Các lượt B-E được giữ tách riêng để nối tiếp bằng dữ liệu đã duyệt.

## Nội dung offline

Các tuần 1-12 có sẵn học liệu offline: Tuần 1 nằm trong [offline.txt](./offline.txt), các tuần còn lại nằm trong [offlineTopics.js](./js/offlineTopics.js). Mỗi tuần có từ vựng, cụm từ, ngữ pháp, reading, listening và mini test. Khi mở một tuần trên `course.html`, trang sẽ ưu tiên nội dung này và không gọi API. Các nút phát âm dùng giọng tiếng Anh của trình duyệt.

Khi chọn một chủ đề, roadmap sẽ chuyển sang chế độ học toàn trang để dễ đọc trên máy tính và điện thoại. Nhấn **Quay lại 12 chủ đề** để trở về danh sách tuần.
