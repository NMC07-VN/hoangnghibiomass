# Hoàng Nghi Biomass

Website giới thiệu Công ty TNHH Hoàng Nghi Biomass.

## Chỉnh sửa
- index.html: nội dung và bố cục
- company.css: giao diện
- company.js: banner và tab nguyên liệu
- assets/: ảnh WebP đã tối ưu
- news.json: tiêu đề, đường dẫn bài và ảnh từ ba nguồn báo tiếng Việt

## Chạy và xuất bản
Website dùng HTML/CSS/JavaScript tĩnh, không cần cơ sở dữ liệu hoặc khóa bí mật. GitHub Pages xuất bản bằng workflow .github/workflows/pages.yml. Chọn Settings → Pages → Source → GitHub Actions.

Workflow cập nhật tin lúc 07:00 giờ Việt Nam mỗi ngày và mỗi lần đẩy mã nguồn. Chỉ lấy metadata, không lưu nội dung bài hay tải ảnh tin tức. Nếu nguồn tạm lỗi, giữ liên kết gần nhất.

Kiểm tra cục bộ: node scripts/update-news.mjs rồi node scripts/build.mjs. Phục vụ thư mục _site bằng máy chủ HTTP để xem trước.

Điện thoại: 0988 997 372 · Email: hoangnghibiomass@gmail.com
