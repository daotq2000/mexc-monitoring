# Hướng dẫn Exchange Switch với Links

## Tổng quan
Đã cải tiến giao diện để thêm dropdown chuyển đổi context giữa MEXC và Gate.io, cùng với các link trực tiếp đến các sàn giao dịch.

## Tính năng mới

### 1. **Dropdown Switch Context**
- **Vị trí**: Header của trang chính và trang automation
- **Chức năng**: Chuyển đổi giữa MEXC (🔥) và Gate.io (🚪)
- **Hiệu ứng**: Theme và màu sắc tự động thay đổi

### 2. **Exchange Links**
- **MEXC Link**: `https://www.mexc.com` - Mở trong tab mới
- **Gate.io Link**: `https://www.gate.io` - Mở trong tab mới
- **Styling**: Màu sắc theo theme của từng sàn
- **Highlighting**: Link của sàn hiện tại được highlight, link khác mờ đi

### 3. **Giao diện cải tiến**
- **Layout**: Exchange selector được thiết kế lại với 2 hàng
  - Hàng 1: Label + Dropdown
  - Hàng 2: Exchange links
- **Responsive**: Tự động điều chỉnh trên mobile
- **Visual feedback**: Hiệu ứng hover và transition mượt mà

## Cách sử dụng

### 1. **Chuyển đổi sàn giao dịch**
```
1. Mở ứng dụng tại http://localhost:3000
2. Sử dụng dropdown "Sàn giao dịch" ở header
3. Chọn MEXC hoặc Gate.io
4. Giao diện sẽ tự động cập nhật theme
```

### 2. **Truy cập sàn giao dịch**
```
1. Click vào link "MEXC" để mở MEXC Exchange
2. Click vào link "Gate.io" để mở Gate.io Exchange
3. Links mở trong tab mới để không làm gián đoạn workflow
```

### 3. **Trang Automation**
```
1. Truy cập http://localhost:3000/automation.html
2. Sử dụng dropdown tương tự để chuyển đổi context
3. Automation sẽ chạy cho sàn được chọn
```

## Technical Details

### HTML Structure
```html
<div class="exchange-selector">
    <div class="exchange-selector-row">
        <label for="exchangeSelect">Sàn giao dịch:</label>
        <select id="exchangeSelect" class="exchange-select">
            <option value="mexc">🔥 MEXC</option>
            <option value="gateio">🚪 Gate.io</option>
        </select>
    </div>
    <div class="exchange-links">
        <a href="https://www.mexc.com" target="_blank" class="exchange-link mexc-link">
            <i class="fas fa-external-link-alt"></i> MEXC
        </a>
        <a href="https://www.gate.io" target="_blank" class="exchange-link gateio-link">
            <i class="fas fa-external-link-alt"></i> Gate.io
        </a>
    </div>
</div>
```

### CSS Classes
- `.exchange-selector`: Container chính
- `.exchange-selector-row`: Hàng chứa label và dropdown
- `.exchange-links`: Container chứa các link
- `.exchange-link`: Styling cho từng link
- `.mexc-link` / `.gateio-link`: Styling riêng cho từng sàn

### JavaScript Functions
- `updateExchangeTheme()`: Cập nhật theme khi chuyển đổi
- `updateExchangeLinks()`: Highlight link tương ứng với sàn được chọn

## Responsive Design

### Desktop (>768px)
- Exchange selector hiển thị ngang
- Links nằm cạnh nhau
- Full styling và hiệu ứng

### Tablet (768px)
- Exchange selector vẫn ngang
- Links có thể xếp dọc nếu cần
- Giảm padding và font size

### Mobile (<480px)
- Exchange selector xếp dọc
- Links xếp dọc
- Tối ưu cho màn hình nhỏ

## Demo

Để xem demo, mở file `demo-exchange-switch.html` trong trình duyệt:
1. Chuyển đổi giữa MEXC và Gate.io
2. Click vào các link để test
3. Quan sát sự thay đổi theme và highlighting

## Lợi ích

1. **Workflow tối ưu**: Chuyển đổi context nhanh chóng
2. **Truy cập nhanh**: Link trực tiếp đến sàn giao dịch
3. **Visual feedback**: Dễ dàng biết đang ở context nào
4. **Responsive**: Hoạt động tốt trên mọi thiết bị
5. **Consistent**: Giao diện nhất quán trên toàn bộ ứng dụng

## Files đã cập nhật

- `public/index.html`: Thêm exchange links
- `public/automation.html`: Thêm exchange links
- `public/styles.css`: Styling cho exchange selector và links
- `public/script.js`: Logic xử lý highlighting
- `demo-exchange-switch.html`: File demo

## URLs

- **MEXC Exchange**: https://www.mexc.com
- **Gate.io Exchange**: https://www.gate.io
- **App Dashboard**: http://localhost:3000
- **Automation Page**: http://localhost:3000/automation.html

