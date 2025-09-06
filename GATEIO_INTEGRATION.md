# Gate.io Integration - Hướng dẫn sử dụng

## Tổng quan
Hệ thống MEXC Futures Monitor đã được mở rộng để hỗ trợ cả MEXC và Gate.io, cho phép người dùng theo dõi và phân tích dữ liệu futures từ cả hai sàn giao dịch.

## Tính năng mới

### 1. Chọn sàn giao dịch
- **Dashboard chính**: Dropdown chọn sàn giao dịch (MEXC/Gate.io) ở góc trên bên phải
- **Trang Automation**: Dropdown chọn sàn giao dịch trong card trạng thái hệ thống
- Dữ liệu sẽ được cập nhật tự động khi chuyển đổi sàn

### 2. API hỗ trợ cả hai sàn
Tất cả các API endpoints đều hỗ trợ tham số `exchange`:
- `GET /api/futures?exchange=mexc|gateio`
- `GET /api/stats?exchange=mexc|gateio`
- `GET /api/export/excel?exchange=mexc|gateio`
- `GET /api/export/low-oc?exchange=mexc|gateio`
- `POST /api/upload-template` (với `exchange` trong body)
- `GET /api/automation/status?exchange=mexc|gateio`

### 3. Automation cho cả hai sàn
- Cấu hình automation riêng biệt cho từng sàn
- File cấu hình: `config/automation.json`
- Trường `exchange` trong config xác định sàn mặc định

## Cấu trúc dữ liệu

### Gate.io Data Format
```javascript
{
  "symbol": "BTC_USDT",
  "baseAsset": "BTC", 
  "quoteAsset": "USDT",
  "price": 111123.4,
  "priceChange": 1675.6,
  "priceChangePercent": 1.53,
  "volume": 764252160,
  "quoteVolume": 8495139042,
  "marketCap": 8495139042,
  "high24h": 111702.7,
  "low24h": 109288,
  "openPrice": 109447.8,
  "lastUpdate": "2025-09-05T04:16:40.553Z"
}
```

### MEXC Data Format (không thay đổi)
```javascript
{
  "symbol": "BTCUSDT",
  "baseAsset": "BTC",
  "quoteAsset": "USDT", 
  "price": 111123.3,
  "priceChange": 1675.6,
  "priceChangePercent": 1.53,
  "volume": 401111605,
  "quoteVolume": 4428747080.34107,
  "marketCap": 4428747080.34107,
  "high24h": 111743.8,
  "low24h": 109284.3,
  "openPrice": 109447.7,
  "lastUpdate": "2025-09-05T04:15:00.330Z"
}
```

## Cách sử dụng

### 1. Khởi động hệ thống
```bash
node server.js
```

### 2. Truy cập giao diện
- **Dashboard chính**: http://localhost:3000
- **Trang Automation**: http://localhost:3000/automation.html

### 3. Chuyển đổi sàn giao dịch
1. Sử dụng dropdown "Sàn giao dịch" ở góc trên bên phải
2. Chọn MEXC hoặc Gate.io
3. Dữ liệu sẽ được cập nhật tự động

### 4. Export dữ liệu
- Excel/CSV files sẽ có prefix tương ứng với sàn:
  - `mexc-futures-all-{timestamp}.xlsx`
  - `gateio-futures-all-{timestamp}.xlsx`

### 5. Automation
- Cấu hình automation trong `config/automation.json`
- Thay đổi `"exchange": "mexc"` thành `"exchange": "gateio"` để chuyển sang Gate.io
- Hoặc sử dụng dropdown trong giao diện automation

## Cấu hình

### File cấu hình automation
```json
{
  "automation": {
    "enabled": true,
    "intervalHours": 6,
    "maxCoins": 50,
    "minPriceChangePercent": 5,
    "maxPriceChangePercent": 100,
    "minVolume": 1000000,
    "sortBy": "priceChangePercent",
    "sortOrder": "desc",
    "exchange": "mexc"
  }
}
```

## API Endpoints

### Futures Data
```bash
# MEXC data
curl "http://localhost:3000/api/futures?exchange=mexc&limit=10"

# Gate.io data  
curl "http://localhost:3000/api/futures?exchange=gateio&limit=10"
```

### Statistics
```bash
# MEXC stats
curl "http://localhost:3000/api/stats?exchange=mexc"

# Gate.io stats
curl "http://localhost:3000/api/stats?exchange=gateio"
```

### Export
```bash
# Export MEXC data
curl "http://localhost:3000/api/export/excel?exchange=mexc" -o mexc-data.xlsx

# Export Gate.io data
curl "http://localhost:3000/api/export/excel?exchange=gateio" -o gateio-data.xlsx
```

## Lưu ý kỹ thuật

### 1. Caching
- Mỗi sàn có cache riêng biệt: `futuresData`/`gateIOData`
- Cập nhật dữ liệu mỗi phút cho cả hai sàn
- Timestamp cập nhật riêng biệt: `lastUpdate`/`gateIOLastUpdate`

### 2. Error Handling
- Nếu một sàn gặp lỗi, sàn còn lại vẫn hoạt động bình thường
- Logs riêng biệt cho từng sàn trong console

### 3. Performance
- Dữ liệu được fetch song song cho cả hai sàn
- Frontend chỉ load dữ liệu của sàn được chọn

## Troubleshooting

### 1. Dữ liệu Gate.io không hiển thị
- Kiểm tra kết nối internet
- Xem logs trong console để tìm lỗi API
- Thử restart server: `pkill -f "node server.js" && node server.js`

### 2. Automation không hoạt động
- Kiểm tra file `config/automation.json`
- Đảm bảo `enabled: true`
- Kiểm tra `exchange` field có đúng không

### 3. Export không hoạt động
- Kiểm tra quyền ghi file trong thư mục `generated_strategies/`
- Đảm bảo có dữ liệu trong cache trước khi export

## Changelog

### v2.0.0 - Gate.io Integration
- ✅ Thêm hỗ trợ Gate.io API
- ✅ Giao diện chọn sàn giao dịch
- ✅ API endpoints hỗ trợ cả hai sàn
- ✅ Automation cho cả hai sàn
- ✅ Export dữ liệu với prefix sàn
- ✅ Caching riêng biệt cho mỗi sàn
- ✅ Error handling độc lập
