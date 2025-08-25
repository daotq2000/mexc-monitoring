# MEXC Futures Monitoring

Ứng dụng Node.js để theo dõi và phân tích các coin futures trên sàn MEXC với giao diện web đẹp và các tính năng filter, sort, search mạnh mẽ.

## 🚀 Tính năng

### 📊 Dashboard
- **Thống kê tổng quan**: Tổng số coin, tổng vốn hóa, biến động trung bình
- **Top Performers**: Top 10 coin tăng/giảm nhiều nhất và có volume cao nhất
- **Cập nhật real-time**: Dữ liệu được cập nhật tự động mỗi phút

### 🔍 Filter & Search
- **Tìm kiếm**: Tìm coin theo tên hoặc symbol
- **Filter theo biến động giá**: Lọc coin theo % thay đổi giá (min/max)
- **Filter theo volume**: Lọc theo khối lượng giao dịch 24h
- **Filter theo vốn hóa**: Lọc theo vốn hóa thị trường

### 📊 Export & Data Management
- **Export Excel**: Xuất dữ liệu đã filter ra file Excel
- **Export Tất cả**: Xuất toàn bộ dữ liệu từ MEXC
- **Tên file tự động**: Timestamp và phân loại dữ liệu
- **Thông báo real-time**: Hiển thị trạng thái export

### 📈 Sort & Display
- **Sắp xếp**: Theo tên, giá, biến động %, volume, vốn hóa, giá cao/thấp nhất 24h
- **Thứ tự**: Tăng dần/giảm dần
- **Bảng dữ liệu**: Hiển thị đầy đủ thông tin với giao diện responsive

### 🎨 Giao diện
- **Modern UI**: Thiết kế đẹp với gradient và glassmorphism
- **Responsive**: Tương thích mọi thiết bị
- **Interactive**: Hover effects, loading states, smooth animations

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Node.js 14+ 
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd mexc-monitoring
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Khởi chạy ứng dụng
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc dự án

```
mexc-monitoring/
├── server.js              # Server chính với Express
├── package.json           # Dependencies và scripts
├── public/                # Frontend files
│   ├── index.html        # Giao diện chính
│   ├── styles.css        # CSS styles
│   └── script.js         # JavaScript logic
└── README.md             # Hướng dẫn sử dụng
```

## 🔧 API Endpoints

### GET `/api/futures`
Lấy danh sách coin futures với filter và sort

**Query Parameters:**
- `search`: Tìm kiếm theo tên/symbol
- `sortBy`: Sắp xếp theo field (symbol, price, priceChangePercent, volume, marketCap, high24h, low24h)
- `sortOrder`: Thứ tự sắp xếp (asc/desc)
- `minPriceChange`/`maxPriceChange`: Filter theo % biến động giá
- `minVolume`/`maxVolume`: Filter theo volume
- `minMarketCap`/`maxMarketCap`: Filter theo vốn hóa

### GET `/api/stats`
Lấy thống kê tổng quan và top performers

## 📱 Sử dụng

### 1. Xem tổng quan
- Dashboard hiển thị thống kê tổng quan về thị trường
- Top 10 coin tăng/giảm nhiều nhất
- Top 10 coin có volume cao nhất

### 2. Tìm kiếm và lọc
- Sử dụng ô tìm kiếm để tìm coin cụ thể
- Điều chỉnh các filter để lọc coin theo tiêu chí mong muốn
- Nhấn "Áp dụng" để thực hiện filter

### 3. Sắp xếp dữ liệu
- Chọn field để sắp xếp từ dropdown
- Nhấn nút sort để thay đổi thứ tự tăng/giảm

### 4. Xem chi tiết
- Bảng dữ liệu hiển thị thông tin chi tiết của từng coin
- Hover để highlight dòng
- Click vào header để sắp xếp theo cột

## 🔄 Cập nhật dữ liệu

- **Tự động**: Dữ liệu được cập nhật mỗi phút từ MEXC API
- **Manual**: Refresh trang để cập nhật ngay lập tức
- **Real-time**: Thời gian cập nhật cuối cùng được hiển thị

## 🎯 Dữ liệu hiển thị

Mỗi coin futures bao gồm:
- **Symbol**: Tên giao dịch (ví dụ: BTCUSDT)
- **Base Asset**: Tên coin gốc (ví dụ: BTC)
- **Giá hiện tại**: Giá giao dịch hiện tại
- **Biến động 24h**: % thay đổi giá trong 24h qua
- **Volume 24h**: Khối lượng giao dịch 24h
- **Vốn hóa**: Vốn hóa thị trường
- **Giá cao nhất/thấp nhất 24h**: Mức giá cao nhất và thấp nhất trong 24h

## 🚨 Lưu ý

- Ứng dụng sử dụng MEXC Public API, không cần API key
- Dữ liệu được cache để tối ưu hiệu suất
- Rate limit: Cập nhật mỗi phút để tránh quá tải API
- Giao diện responsive, tương thích mọi thiết bị

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc có câu hỏi, hãy:
- Tạo Issue trên GitHub
- Liên hệ qua email
- Tham gia thảo luận trong Discussions

---

**Made with ❤️ for the crypto community**
# mexc-monitoring
