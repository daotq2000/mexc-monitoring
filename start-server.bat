@echo off
echo ========================================
echo    MEXC Monitoring Server
echo ========================================
echo.

echo [1/3] Đang kiểm tra Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt!
    echo    Vui lòng tải và cài đặt Node.js từ: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js đã được cài đặt

echo.
echo [2/3] Đang kiểm tra dependencies...
if not exist node_modules (
    echo 📦 Đang cài đặt dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Lỗi khi cài đặt dependencies!
        pause
        exit /b 1
    )
    echo ✅ Dependencies đã được cài đặt
) else (
    echo ✅ Dependencies đã sẵn sàng
)

echo.
echo [3/3] Đang khởi động server...
echo.
echo 🚀 Server sẽ chạy tại: http://localhost:3000
echo 📊 Mở trình duyệt và truy cập: http://localhost:3000
echo.
echo 💡 Nhấn Ctrl+C để dừng server
echo.

node server.js

pause
