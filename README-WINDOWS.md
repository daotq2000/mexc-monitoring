# 🪟 Hướng dẫn chạy MEXC Monitoring trên Windows

## 🚀 Cách chạy nhanh nhất

### **Phương pháp 1: Sử dụng file batch (Khuyến nghị)**
1. **Double-click** vào file `start-server.bat`
2. Đợi server khởi động
3. Mở trình duyệt và truy cập: `http://localhost:3000`

### **Phương pháp 2: Sử dụng Command Prompt**
1. Mở **Command Prompt** (cmd)
2. Di chuyển đến thư mục project:
   ```cmd
   cd D:\mexc-monitoring
   ```
3. Chạy lệnh:
   ```cmd
   node server.js
   ```

### **Phương pháp 3: Sử dụng PowerShell**
1. Mở **PowerShell**
2. Di chuyển đến thư mục project:
   ```powershell
   cd D:\mexc-monitoring
   ```
3. Chạy lệnh:
   ```powershell
   node server.js
   ```

## 📋 Yêu cầu hệ thống

- **Node.js** phiên bản 14 trở lên
- **Windows** 7/8/10/11
- **RAM** tối thiểu 2GB
- **Dung lượng** trống 100MB

## 🔧 Cài đặt Node.js

1. Truy cập: https://nodejs.org
2. Tải phiên bản **LTS** (Long Term Support)
3. Chạy file installer và làm theo hướng dẫn
4. Khởi động lại Command Prompt/PowerShell

## 🛠️ Khắc phục sự cố

### **Lỗi: 'node' is not recognized**
- **Nguyên nhân**: Node.js chưa được cài đặt hoặc chưa được thêm vào PATH
- **Giải pháp**: 
  1. Cài đặt Node.js từ https://nodejs.org
  2. Khởi động lại Command Prompt
  3. Chạy `node --version` để kiểm tra

### **Lỗi: ENOENT: no such file or directory**
- **Nguyên nhân**: Thiếu file hoặc thư mục cần thiết
- **Giải pháp**: Chạy `node setup-windows.js` trước khi start server

### **Lỗi: Port 3000 is already in use**
- **Nguyên nhân**: Port 3000 đã được sử dụng bởi ứng dụng khác
- **Giải pháp**:
  1. Tìm và dừng process đang sử dụng port 3000:
     ```cmd
     netstat -ano | findstr :3000
     taskkill /PID <PID_NUMBER> /F
     ```
  2. Hoặc thay đổi port trong file `server.js`

### **Lỗi: npm install failed**
- **Nguyên nhân**: Kết nối mạng hoặc quyền truy cập
- **Giải pháp**:
  1. Chạy Command Prompt với quyền Administrator
  2. Kiểm tra kết nối mạng
  3. Thử chạy: `npm install --verbose`

## 📊 Tính năng chính

- ✅ **Theo dõi coin futures** từ MEXC và Gate.io
- ✅ **Tìm kiếm và lọc** coin theo nhiều tiêu chí
- ✅ **Export Excel** dữ liệu đã lọc hoặc tất cả
- ✅ **Upload template** và tạo strategy tự động
- ✅ **Giao diện đẹp** và responsive

## 🌐 Truy cập ứng dụng

Sau khi server khởi động thành công:
- **URL chính**: http://localhost:3000
- **API Stats**: http://localhost:3000/api/stats
- **API Futures**: http://localhost:3000/api/futures

## 📁 Cấu trúc thư mục

```
mexc-monitoring/
├── public/                 # Frontend files
│   ├── index.html         # Trang chủ
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript
├── automation/            # Automation modules
├── config/               # Configuration files
├── generated_strategies/ # Generated strategy files
├── uploads/              # Uploaded files
├── server.js             # Main server file
├── start-server.bat      # Windows batch script
└── setup-windows.js      # Setup script
```

## 🆘 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra log trong Command Prompt
2. Đảm bảo Node.js đã được cài đặt đúng
3. Kiểm tra kết nối mạng
4. Thử chạy `node setup-windows.js` trước

## 🎉 Chúc bạn sử dụng thành công!

---
*Tạo bởi MEXC Monitoring Team*
