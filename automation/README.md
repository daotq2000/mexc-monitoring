# MEXC Automation System

Hệ thống tự động hóa để generate chiến lược trading từ dữ liệu coin biến động trên sàn MEXC.

## 🚀 Tính năng chính

### 1. **Tự động query và sort coin biến động**
- Lấy danh sách coin từ MEXC API
- Filter theo % thay đổi giá, volume, market cap
- Sort theo tiêu chí tùy chọn
- Giới hạn số lượng coin tối đa

### 2. **Generate CSV chiến lược tự động**
- Sử dụng template CSV có sẵn
- Tạo nhiều chiến lược với các giá trị OC khác nhau (40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95)
- Mỗi coin sẽ tạo ra 12 chiến lược khác nhau
- Format Excel (.xlsx) với cột tự động điều chỉnh

### 3. **Upload tự động lên API bên thứ 3**
- Hỗ trợ upload file lên external API
- Cấu hình linh hoạt (base URL, endpoint, headers)
- Xử lý lỗi và retry

### 4. **Scheduler tự động**
- Chạy theo interval cấu hình (mặc định: 6 giờ)
- Chạy ngay lập tức khi cần
- Theo dõi trạng thái và lịch sử

## 📁 Cấu trúc thư mục

```
automation/
├── README.md                 # Hướng dẫn này
├── strategyGenerator.js      # Module chính generate chiến lược
├── scheduler.js             # Scheduler tự động
└── routes.js                # API routes quản lý

config/
└── automation.json          # File cấu hình

generated_strategies/        # Thư mục chứa file output
```

## ⚙️ Cấu hình

### File `config/automation.json`

```json
{
  "automation": {
    "enabled": true,                    // Bật/tắt automation
    "intervalHours": 6,                 // Interval chạy (giờ)
    "maxCoins": 50,                     // Số coin tối đa
    "minPriceChangePercent": 5,         // % thay đổi giá tối thiểu
    "maxPriceChangePercent": 100,       // % thay đổi giá tối đa
    "minVolume": 1000000,               // Volume tối thiểu
    "sortBy": "priceChangePercent",     // Sắp xếp theo
    "sortOrder": "desc"                 // Thứ tự sắp xếp
  },
  "csvTemplate": {
    // Template cho CSV chiến lược
    "userId": "TpsyfqmGHWcHXBdKFT2BDX2Vnla2",
    "userName": "mexc-daotq",
    "botId": "68657b85769eaf53113f0dd8",
    "botName": "Oc trên 100",
    // ... các thông số khác
  },
  "thirdPartyAPI": {
    "enabled": false,                   // Bật/tắt upload API
    "baseUrl": "",                      // URL API bên thứ 3
    "endpoint": "/upload-strategy",     // Endpoint upload
    "apiKey": "",                       // API key
    "headers": {}                       // Headers tùy chỉnh
  },
  "output": {
    "csvDirectory": "./generated_strategies",
    "filenamePrefix": "strategy_auto_generated",
    "includeTimestamp": true
  }
}
```

## 🔧 Sử dụng

### 1. **Khởi động automation**
```bash
# Truy cập giao diện web
http://localhost:3000/automation.html

# Hoặc gọi API trực tiếp
POST /api/automation/start
```

### 2. **Chạy ngay lập tức**
```bash
POST /api/automation/run-now
```

### 3. **Dừng automation**
```bash
POST /api/automation/stop
```

### 4. **Xem trạng thái**
```bash
GET /api/automation/status
```

### 5. **Quản lý files**
```bash
# Lấy danh sách files
GET /api/automation/files

# Download file
GET /api/automation/files/{filename}

# Xóa file
DELETE /api/automation/files/{filename}
```

### 6. **Cập nhật cấu hình**
```bash
POST /api/automation/config
Content-Type: application/json

{
  "automation": {
    "intervalHours": 4,
    "maxCoins": 30
  }
}
```

## 📊 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/automation/status` | Trạng thái hệ thống |
| POST | `/api/automation/start` | Khởi động automation |
| POST | `/api/automation/stop` | Dừng automation |
| POST | `/api/automation/run-now` | Chạy ngay lập tức |
| GET | `/api/automation/files` | Danh sách files |
| GET | `/api/automation/files/:filename` | Download file |
| DELETE | `/api/automation/files/:filename` | Xóa file |
| GET | `/api/automation/config` | Lấy cấu hình |
| POST | `/api/automation/config` | Cập nhật cấu hình |

## 🔄 Quy trình hoạt động

1. **Lấy dữ liệu coin**: Query MEXC API với filter và sort
2. **Generate chiến lược**: Tạo CSV với template và các giá trị OC
3. **Lưu file**: Lưu vào thư mục `generated_strategies`
4. **Upload API**: Gửi file lên API bên thứ 3 (nếu được cấu hình)
5. **Lặp lại**: Theo interval đã cấu hình

## 📈 Monitoring

- **Trạng thái real-time**: Đang chạy/đã dừng
- **Lịch sử chạy**: Thời gian, số lần chạy
- **Files generated**: Danh sách, kích thước, thời gian tạo
- **Logs**: Console logs chi tiết

## 🚨 Xử lý lỗi

- **API MEXC**: Retry và fallback
- **File generation**: Validation và error handling
- **Upload API**: Timeout và retry logic
- **Scheduler**: Conflict prevention

## 🔧 Troubleshooting

### Automation không chạy
1. Kiểm tra `automation.enabled` trong config
2. Kiểm tra logs console
3. Kiểm tra kết nối MEXC API

### Files không được generate
1. Kiểm tra quyền thư mục `generated_strategies`
2. Kiểm tra cấu hình CSV template
3. Kiểm tra logs lỗi

### Upload API thất bại
1. Kiểm tra cấu hình `thirdPartyAPI`
2. Kiểm tra kết nối mạng
3. Kiểm tra API key và headers

## 📝 Ghi chú

- Hệ thống tự động restart khi server restart
- Files được đặt tên với timestamp để tránh conflict
- Mỗi coin tạo ra 12 chiến lược với OC khác nhau
- Có thể cấu hình interval từ 1-24 giờ
- Hỗ trợ multiple file formats (Excel, CSV)

## 🤝 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs của server
2. Network tab trong browser
3. File cấu hình `automation.json`
4. Quyền thư mục và files
