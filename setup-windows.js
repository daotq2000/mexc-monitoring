const fs = require('fs');
const path = require('path');

console.log('🔧 Đang kiểm tra và tạo các file cần thiết cho Windows...');

// Tạo thư mục public nếu chưa có
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Đã tạo thư mục public');
} else {
    console.log('✅ Thư mục public đã tồn tại');
}

// Tạo file index.html nếu chưa có
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
    const indexContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MEXC Monitoring - Theo dõi Coin Futures</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 MEXC Monitoring</h1>
            <p>Theo dõi coin futures trên sàn MEXC và Gate.io</p>
        </header>

        <div class="controls">
            <div class="search-section">
                <input type="text" id="searchInput" placeholder="Tìm kiếm coin...">
                <select id="exchangeSelect">
                    <option value="mexc">MEXC</option>
                    <option value="gateio">Gate.io</option>
                </select>
            </div>
            
            <div class="filter-section">
                <div class="filter-group">
                    <label>Biến động giá (%):</label>
                    <input type="number" id="minPriceChange" placeholder="Min %" step="0.01">
                    <input type="number" id="maxPriceChange" placeholder="Max %" step="0.01">
                </div>
                
                <div class="filter-group">
                    <label>Volume (24h):</label>
                    <input type="number" id="minVolume" placeholder="Min Volume">
                    <input type="number" id="maxVolume" placeholder="Max Volume">
                </div>
                
                <div class="filter-group">
                    <label>Vốn hóa:</label>
                    <input type="number" id="minMarketCap" placeholder="Min Market Cap">
                    <input type="number" id="maxMarketCap" placeholder="Max Market Cap">
                </div>
            </div>

            <div class="action-section">
                <button id="searchBtn" class="btn btn-primary">🔍 Tìm kiếm</button>
                <button id="exportBtn" class="btn btn-success">📊 Export Excel</button>
                <button id="exportAllBtn" class="btn btn-warning">📈 Export Tất cả</button>
                <button id="uploadBtn" class="btn btn-info">📤 Upload Template</button>
            </div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Tổng số coin</h3>
                <span id="totalCoins">-</span>
            </div>
            <div class="stat-card">
                <h3>Tổng vốn hóa</h3>
                <span id="totalMarketCap">-</span>
            </div>
            <div class="stat-card">
                <h3>Biến động TB</h3>
                <span id="avgPriceChange">-</span>
            </div>
            <div class="stat-card">
                <h3>Cập nhật lần cuối</h3>
                <span id="lastUpdate">-</span>
            </div>
        </div>

        <div class="table-container">
            <table id="dataTable">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Base Asset</th>
                        <th>Giá hiện tại</th>
                        <th>Biến động 24h</th>
                        <th>Biến động 24h (%)</th>
                        <th>Volume 24h</th>
                        <th>Vốn hóa</th>
                        <th>Giá cao nhất</th>
                        <th>Giá thấp nhất</th>
                        <th>Thời gian cập nhật</th>
                    </tr>
                </thead>
                <tbody id="dataTableBody">
                    <!-- Dữ liệu sẽ được load ở đây -->
                </tbody>
            </table>
        </div>

        <div class="loading" id="loading" style="display: none;">
            <div class="spinner"></div>
            <p>Đang tải dữ liệu...</p>
        </div>
    </div>

    <input type="file" id="fileInput" accept=".csv" style="display: none;">

    <script src="script.js"></script>
</body>
</html>`;
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Đã tạo file index.html');
} else {
    console.log('✅ File index.html đã tồn tại');
}

// Tạo file styles.css nếu chưa có
const stylesPath = path.join(publicDir, 'styles.css');
if (!fs.existsSync(stylesPath)) {
    const stylesContent = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 30px;
    color: white;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.controls {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    margin-bottom: 30px;
}

.search-section {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.search-section input,
.search-section select {
    flex: 1;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    min-width: 200px;
}

.filter-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-weight: 600;
    color: #555;
}

.filter-group input {
    padding: 10px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 14px;
}

.action-section {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
    transform: translateY(-2px);
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover {
    background: #1e7e34;
    transform: translateY(-2px);
}

.btn-warning {
    background: #ffc107;
    color: #212529;
}

.btn-warning:hover {
    background: #e0a800;
    transform: translateY(-2px);
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-info:hover {
    background: #138496;
    transform: translateY(-2px);
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stat-card h3 {
    color: #666;
    margin-bottom: 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.stat-card span {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.table-container {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #e1e5e9;
}

th {
    background: #f8f9fa;
    font-weight: 600;
    color: #555;
    position: sticky;
    top: 0;
}

tr:hover {
    background: #f8f9fa;
}

.positive {
    color: #28a745;
    font-weight: bold;
}

.negative {
    color: #dc3545;
    font-weight: bold;
}

.loading {
    text-align: center;
    padding: 50px;
    color: white;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .search-section {
        flex-direction: column;
    }
    
    .action-section {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    table {
        min-width: 800px;
    }
}`;
    
    fs.writeFileSync(stylesPath, stylesContent);
    console.log('✅ Đã tạo file styles.css');
} else {
    console.log('✅ File styles.css đã tồn tại');
}

// Tạo file script.js nếu chưa có
const scriptPath = path.join(publicDir, 'script.js');
if (!fs.existsSync(scriptPath)) {
    const scriptContent = `// MEXC Monitoring Frontend Script
let currentData = [];
let currentExchange = 'mexc';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const exchangeSelect = document.getElementById('exchangeSelect');
const minPriceChange = document.getElementById('minPriceChange');
const maxPriceChange = document.getElementById('maxPriceChange');
const minVolume = document.getElementById('minVolume');
const maxVolume = document.getElementById('maxVolume');
const minMarketCap = document.getElementById('minMarketCap');
const maxMarketCap = document.getElementById('maxMarketCap');
const searchBtn = document.getElementById('searchBtn');
const exportBtn = document.getElementById('exportBtn');
const exportAllBtn = document.getElementById('exportAllBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const dataTableBody = document.getElementById('dataTableBody');
const loading = document.getElementById('loading');

// Stats elements
const totalCoins = document.getElementById('totalCoins');
const totalMarketCap = document.getElementById('totalMarketCap');
const avgPriceChange = document.getElementById('avgPriceChange');
const lastUpdate = document.getElementById('lastUpdate');

// Event Listeners
searchBtn.addEventListener('click', searchData);
exportBtn.addEventListener('click', exportData);
exportAllBtn.addEventListener('click', exportAllData);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);
exchangeSelect.addEventListener('change', (e) => {
    currentExchange = e.target.value;
    loadData();
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadStats();
});

// Load data from API
async function loadData() {
    try {
        showLoading(true);
        const response = await fetch(\`/api/futures?exchange=\${currentExchange}\`);
        const data = await response.json();
        
        if (data.data) {
            currentData = data.data;
            displayData(currentData);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(\`/api/stats?exchange=\${currentExchange}\`);
        const data = await response.json();
        
        if (data) {
            totalCoins.textContent = data.totalCoins.toLocaleString();
            totalMarketCap.textContent = formatNumber(data.totalMarketCap);
            avgPriceChange.textContent = data.avgPriceChange.toFixed(2) + '%';
            lastUpdate.textContent = new Date(data.lastUpdate).toLocaleString('vi-VN');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Search data
function searchData() {
    const searchTerm = searchInput.value.toLowerCase();
    const minPrice = parseFloat(minPriceChange.value) || null;
    const maxPrice = parseFloat(maxPriceChange.value) || null;
    const minVol = parseFloat(minVolume.value) || null;
    const maxVol = parseFloat(maxVolume.value) || null;
    const minCap = parseFloat(minMarketCap.value) || null;
    const maxCap = parseFloat(maxMarketCap.value) || null;

    let filteredData = [...currentData];

    // Filter by search term
    if (searchTerm) {
        filteredData = filteredData.filter(coin => 
            coin.symbol.toLowerCase().includes(searchTerm) ||
            coin.baseAsset.toLowerCase().includes(searchTerm)
        );
    }

    // Filter by price change
    if (minPrice !== null) {
        filteredData = filteredData.filter(coin => coin.priceChangePercent >= minPrice);
    }
    if (maxPrice !== null) {
        filteredData = filteredData.filter(coin => coin.priceChangePercent <= maxPrice);
    }

    // Filter by volume
    if (minVol !== null) {
        filteredData = filteredData.filter(coin => coin.volume >= minVol);
    }
    if (maxVol !== null) {
        filteredData = filteredData.filter(coin => coin.volume <= maxVol);
    }

    // Filter by market cap
    if (minCap !== null) {
        filteredData = filteredData.filter(coin => coin.marketCap >= minCap);
    }
    if (maxCap !== null) {
        filteredData = filteredData.filter(coin => coin.marketCap <= maxCap);
    }

    displayData(filteredData);
}

// Display data in table
function displayData(data) {
    dataTableBody.innerHTML = '';
    
    data.forEach(coin => {
        const row = document.createElement('tr');
        
        const priceChangeClass = coin.priceChangePercent >= 0 ? 'positive' : 'negative';
        const priceChangeSymbol = coin.priceChangePercent >= 0 ? '+' : '';
        
        row.innerHTML = \`
            <td><strong>\${coin.symbol}</strong></td>
            <td>\${coin.baseAsset}</td>
            <td>\${coin.price.toFixed(4)}</td>
            <td>\${coin.priceChange.toFixed(4)}</td>
            <td class="\${priceChangeClass}">\${priceChangeSymbol}\${coin.priceChangePercent.toFixed(2)}%</td>
            <td>\${formatNumber(coin.volume)}</td>
            <td>\${formatNumber(coin.marketCap)}</td>
            <td>\${coin.high24h.toFixed(4)}</td>
            <td>\${coin.low24h.toFixed(4)}</td>
            <td>\${new Date(coin.lastUpdate).toLocaleString('vi-VN')}</td>
        \`;
        
        dataTableBody.appendChild(row);
    });
}

// Export filtered data
async function exportData() {
    try {
        showLoading(true);
        const params = new URLSearchParams({
            exchange: currentExchange,
            search: searchInput.value,
            minPriceChange: minPriceChange.value || '',
            maxPriceChange: maxPriceChange.value || '',
            minVolume: minVolume.value || '',
            maxVolume: maxVolume.value || '',
            minMarketCap: minMarketCap.value || '',
            maxMarketCap: maxMarketCap.value || ''
        });

        const response = await fetch(\`/api/export/excel?\${params}\`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`mexc-filtered-data-\${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx\`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Lỗi khi export: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Export all data
async function exportAllData() {
    try {
        showLoading(true);
        const params = new URLSearchParams({
            exchange: currentExchange,
            exportAll: 'true'
        });

        const response = await fetch(\`/api/export/excel?\${params}\`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`mexc-all-data-\${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx\`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            throw new Error('Export failed');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Lỗi khi export: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Handle file upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        alert('Vui lòng chọn file CSV');
        return;
    }

    try {
        showLoading(true);
        const formData = new FormData();
        formData.append('template', file);
        formData.append('exchange', currentExchange);

        const response = await fetch('/api/upload-template', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace('.csv', \`_generated_\${currentExchange}.csv\`);
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert('✅ Tạo file strategy thành công!');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Lỗi khi upload: ' + error.message);
    } finally {
        showLoading(false);
        fileInput.value = '';
    }
}

// Show/hide loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    searchBtn.disabled = show;
    exportBtn.disabled = show;
    exportAllBtn.disabled = show;
    uploadBtn.disabled = show;
}

// Format number
function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log('✅ Đã tạo file script.js');
} else {
    console.log('✅ File script.js đã tồn tại');
}

console.log('🎉 Hoàn thành setup cho Windows!');
console.log('📁 Các file đã được tạo:');
console.log('   - public/index.html');
console.log('   - public/styles.css');
console.log('   - public/script.js');
console.log('');
console.log('🚀 Bây giờ bạn có thể chạy: node server.js');
