const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cron = require('node-cron');
const path = require('path');
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');
const multer = require('multer');

// Import automation modules
const automationRoutes = require('./automation/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình multer cho file upload
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file CSV'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cache để lưu dữ liệu
let futuresData = [];
let lastUpdate = null;

// Export để automation module có thể sử dụng
// Chỉ export khi không phải là main module
if (require.main !== module) {
    module.exports = { futuresData, lastUpdate };
}

// Hàm lấy dữ liệu từ MEXC API
async function fetchMEXCFuturesData() {
    try {
        console.log('Đang cập nhật dữ liệu từ MEXC Contract API...');
        
        // Lấy thông tin futures contracts từ MEXC
        const contractResponse = await axios.get('https://contract.mexc.com/api/v1/contract/ticker');
        const contracts = contractResponse.data.data || [];
        
        // Chuyển đổi dữ liệu từ contract API
        const convertedData = contracts.map(contract => {
            const baseAsset = contract.symbol.replace('_USDT', '').replace('_USDC', '');
            const quoteAsset = contract.symbol.includes('_USDT') ? 'USDT' : 'USDC';
            
            return {
                symbol: contract.symbol.replace('_', ''), // Chuyển từ SPARK_USDT thành SPARKUSDT
                baseAsset: baseAsset,
                quoteAsset: quoteAsset,
                price: parseFloat(contract.lastPrice) || 0,
                priceChange: parseFloat(contract.riseFallValue) || 0,
                priceChangePercent: parseFloat(contract.riseFallRate) * 100 || 0, // Chuyển từ 0.7546 thành 75.46%
                volume: parseFloat(contract.volume24) || 0,
                quoteVolume: parseFloat(contract.amount24) || 0,
                marketCap: parseFloat(contract.amount24) || 0, // Sử dụng amount24 làm market cap
                high24h: parseFloat(contract.high24Price) || 0,
                low24h: parseFloat(contract.lower24Price) || 0,
                openPrice: parseFloat(contract.lastPrice) - parseFloat(contract.riseFallValue) || 0,
                lastUpdate: new Date().toISOString()
            };
        });
        
        futuresData = convertedData;
        lastUpdate = new Date().toISOString();
        
        console.log(`Đã cập nhật ${futuresData.length} futures contracts`);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ MEXC Contract API:', error.message);
    }
}

// Cập nhật dữ liệu mỗi 1 phút
cron.schedule('* * * * *', fetchMEXCFuturesData);

// API Routes
app.get('/api/futures', (req, res) => {
    const { 
        search, 
        sortBy = 'symbol', 
        sortOrder = 'asc',
        minPriceChange = null,
        maxPriceChange = null,
        minVolume = null,
        maxVolume = null,
        minMarketCap = null,
        maxMarketCap = null
    } = req.query;
    
    let filteredData = [...futuresData];
    
    // Filter theo search
    if (search) {
        filteredData = filteredData.filter(coin => 
            coin.symbol.toLowerCase().includes(search.toLowerCase()) ||
            coin.baseAsset.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Filter chỉ lấy coin USDT, loại bỏ USDC và các quote asset khác
    filteredData = filteredData.filter(coin => coin.quoteAsset === 'USDT');
    
    // Filter theo price change
    if (minPriceChange !== null) {
        filteredData = filteredData.filter(coin => 
            coin.priceChangePercent >= parseFloat(minPriceChange)
        );
    }
    
    if (maxPriceChange !== null) {
        filteredData = filteredData.filter(coin => 
            coin.priceChangePercent <= parseFloat(maxPriceChange)
        );
    }
    
    // Filter theo volume
    if (minVolume !== null) {
        filteredData = filteredData.filter(coin => 
            coin.volume >= parseFloat(minVolume)
        );
    }
    
    if (maxVolume !== null) {
        filteredData = filteredData.filter(coin => 
            coin.volume <= parseFloat(maxVolume)
        );
    }
    
    // Filter theo market cap
    if (minMarketCap !== null) {
        filteredData = filteredData.filter(coin => 
            coin.marketCap >= parseFloat(minMarketCap)
        );
    }
    
    if (maxMarketCap !== null) {
        filteredData = filteredData.filter(coin => 
            coin.marketCap <= parseFloat(maxMarketCap)
        );
    }
    
    // Sort
    filteredData.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
    
    res.json({
        data: filteredData,
        total: filteredData.length,
        lastUpdate: lastUpdate
    });
});

app.get('/api/stats', (req, res) => {
    if (futuresData.length === 0) {
        return res.json({
            totalCoins: 0,
            totalMarketCap: 0,
            avgPriceChange: 0,
            topGainers: [],
            topLosers: [],
            highestVolume: []
        });
    }
    
    const totalMarketCap = futuresData.reduce((sum, coin) => sum + coin.marketCap, 0);
    const avgPriceChange = futuresData.reduce((sum, coin) => sum + coin.priceChangePercent, 0) / futuresData.length;
    
    const topGainers = [...futuresData]
        .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
        .slice(0, 10);
    
    const topLosers = [...futuresData]
        .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
        .slice(0, 10);
    
    const highestVolume = [...futuresData]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);
    
    res.json({
        totalCoins: futuresData.length,
        totalMarketCap: totalMarketCap,
        avgPriceChange: avgPriceChange,
        topGainers: topGainers,
        topLosers: topLosers,
        highestVolume: highestVolume
    });
});

// API Export Excel
app.get('/api/export/excel', (req, res) => {
    try {
        const { 
            search, 
            sortBy = 'symbol', 
            sortOrder = 'asc',
            minPriceChange = null,
            maxPriceChange = null,
            minVolume = null,
            maxVolume = null,
            minMarketCap = null,
            maxMarketCap = null,
            exportAll = 'false'
        } = req.query;
        
        let exportData = [...futuresData];
        
        // Filter chỉ lấy coin USDT, loại bỏ USDC và các quote asset khác
        exportData = exportData.filter(coin => coin.quoteAsset === 'USDT');
        
        // Nếu không phải export tất cả, áp dụng filter
        if (exportAll !== 'true') {
            // Filter theo search
            if (search) {
                exportData = exportData.filter(coin => 
                    coin.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    coin.baseAsset.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            // Filter theo price change
            if (minPriceChange !== null) {
                exportData = exportData.filter(coin => 
                    coin.priceChangePercent >= parseFloat(minPriceChange)
                );
            }
            
            if (maxPriceChange !== null) {
                exportData = exportData.filter(coin => 
                    coin.priceChangePercent <= parseFloat(maxPriceChange)
                );
            }
            
            // Filter theo volume
            if (minVolume !== null) {
                exportData = exportData.filter(coin => 
                    coin.volume >= parseFloat(minVolume)
                );
            }
            
            if (maxVolume !== null) {
                exportData = exportData.filter(coin => 
                    coin.volume <= parseFloat(maxVolume)
                );
            }
            
            // Filter theo market cap
            if (minMarketCap !== null) {
                exportData = exportData.filter(coin => 
                    coin.marketCap >= parseFloat(minMarketCap)
                );
            }
            
            if (maxMarketCap !== null) {
                exportData = exportData.filter(coin => 
                    coin.marketCap <= parseFloat(maxMarketCap)
                );
            }
            
            // Sort
            exportData.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (sortOrder === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }
        
        // Chuẩn bị dữ liệu cho Excel
        const excelData = exportData.map(coin => ({
            'Symbol': coin.symbol ,
            'Base Asset': coin.baseAsset,
            'Quote Asset': coin.quoteAsset,
            'Price (USDT)': coin.price.toFixed(4),
            'Price Change (USDT)': coin.priceChange.toFixed(4),
            'Price Change (%)': coin.priceChangePercent,
            'Volume (24h)': coin.volume.toLocaleString(),
            'Quote Volume (24h)': coin.quoteVolume.toLocaleString(),
            'Market Cap': coin.marketCap.toLocaleString(),
            'High (24h)': coin.high24h.toFixed(4),
            'Low (24h)': coin.low24h.toFixed(4),
            'Open Price': coin.openPrice.toFixed(4),
            'Last Update': new Date(coin.lastUpdate).toLocaleString('vi-VN')
        }));
        
        // Tạo workbook và worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Đặt tên worksheet
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MEXC Futures Data');
        
        // Tự động điều chỉnh cột
        const colWidths = [
            { wch: 12 }, // Symbol
            { wch: 15 }, // Base Asset
            { wch: 15 }, // Quote Asset
            { wch: 15 }, // Price
            { wch: 18 }, // Price Change
            { wch: 15 }, // Price Change %
            { wch: 18 }, // Volume
            { wch: 20 }, // Quote Volume
            { wch: 15 }, // Market Cap
            { wch: 15 }, // High
            { wch: 15 }, // Low
            { wch: 15 }, // Open Price
            { wch: 25 }  // Last Update
        ];
        worksheet['!cols'] = colWidths;
        
        // Tạo buffer Excel
        const excelBuffer = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx' 
        });
        
        // Set headers cho download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = exportAll === 'true' ? 
            `mexc-futures-all-${timestamp}.xlsx` : 
            `mexc-futures-filtered-${timestamp}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        res.send(excelBuffer);
        
        console.log(`✅ Đã export Excel thành công: ${exportData.length} records, filename: ${filename}`);
        
    } catch (error) {
        console.error('❌ Lỗi khi export Excel:', error);
        res.status(500).json({ 
            error: 'Lỗi khi export Excel', 
            message: error.message 
        });
    }
});

// API Upload Template và Export Low OC Strategies
app.post('/api/upload-template', upload.single('template'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'Không có file được upload', 
                message: 'Vui lòng chọn file CSV template' 
            });
        }

        console.log('🔄 Bắt đầu xử lý file template upload...');
        
        // Đọc file template đã upload
        const templatePath = req.file.path;
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const templateLines = templateContent.trim().split('\n').filter(line => line.trim());
        
        // Bỏ qua dòng đầu tiên (header) và lấy từ dòng 1 trở đi
        const dataLines = templateLines.slice(1);
        
        if (dataLines.length === 0) {
            // Cleanup file
            fs.unlinkSync(templatePath);
            return res.status(400).json({ 
                error: 'File template không hợp lệ', 
                message: 'File CSV phải có ít nhất 1 dòng dữ liệu (không tính header)' 
            });
        }
        
        console.log(`📄 Đã đọc ${dataLines.length} dòng template từ file upload`);
        
        // Lấy danh sách coin USDT từ futuresData và sort theo biến động giá giảm dần
        const usdtCoins = futuresData
            .filter(coin => coin.quoteAsset === 'USDT')
            .sort((a, b) => a.priceChangePercent - b.priceChangePercent);
        
        if (usdtCoins.length === 0) {
            // Cleanup file
            fs.unlinkSync(templatePath);
            return res.status(400).json({ 
                error: 'Không có dữ liệu coin USDT', 
                message: 'Vui lòng đợi hệ thống cập nhật dữ liệu từ MEXC' 
            });
        }
        
        console.log(`💰 Tìm thấy ${usdtCoins.length} coin USDT (đã sort theo biến động giá giảm dần)`);
        console.log(`📉 Top 5 coin giảm mạnh nhất: ${usdtCoins.slice(0, 5).map(coin => `${coin.symbol}(${coin.priceChangePercent.toFixed(2)}%)`).join(', ')}`);
        
        // Tạo dữ liệu mới bằng cách nhân bản template cho mỗi coin
        const generatedLines = [];
        
        for (const coin of usdtCoins) {
            for (const templateLine of dataLines) {
                // Parse dòng template
                const columns = templateLine.split(',');
                
                // Thay thế symbol ở cột thứ 5 (index 4) với format mới
                if (columns.length > 4) {
                    // Chuyển đổi từ BTCUSDT thành BTC_USDT
                    const formattedSymbol = coin.symbol.replace('USDT', '_USDT');
                    columns[4] = formattedSymbol;
                }
                
                // Tạo dòng mới
                const newLine = columns.join(',');
                generatedLines.push(newLine);
            }
        }
        
        console.log(`📊 Đã tạo ${generatedLines.length} dòng strategy`);
        
        // Tạo nội dung CSV
        const csvContent = generatedLines.join('\n');
        
        // Cleanup file upload
        fs.unlinkSync(templatePath);
        
        // Set headers cho download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `strategy_OC_thap_upload_${timestamp}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
        
        res.send(csvContent);
        
        console.log(`✅ Đã tạo file OC thấp từ template upload thành công: ${generatedLines.length} strategies, filename: ${filename}`);
        
    } catch (error) {
        console.error('❌ Lỗi khi xử lý template upload:', error);
        
        // Cleanup file nếu có
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            error: 'Lỗi khi xử lý template upload', 
            message: error.message 
        });
    }
});

// API Export Low OC Strategies (giữ nguyên cho tương thích)
app.get('/api/export/low-oc', async (req, res) => {
    try {
        console.log('🔄 Bắt đầu tạo file OC thấp...');
        
        // Đọc template file
        const templatePath = path.join(__dirname, 'template_low.csv');
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ 
                error: 'Template file không tồn tại', 
                message: 'File template_low.csv không được tìm thấy' 
            });
        }
        
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const templateLines = templateContent.trim().split('\n').filter(line => line.trim());
        
        console.log(`📄 Đã đọc ${templateLines.length} dòng template`);
        
        // Lấy danh sách coin USDT từ futuresData và sort theo biến động giá giảm dần
        const usdtCoins = futuresData
            .filter(coin => coin.quoteAsset === 'USDT')
            .sort((a, b) => a.priceChangePercent - b.priceChangePercent); // Sort DESC theo biến động giá (giảm dần)
        
        if (usdtCoins.length === 0) {
            return res.status(400).json({ 
                error: 'Không có dữ liệu coin USDT', 
                message: 'Vui lòng đợi hệ thống cập nhật dữ liệu từ MEXC' 
            });
        }
        
        console.log(`💰 Tìm thấy ${usdtCoins.length} coin USDT (đã sort theo biến động giá giảm dần)`);
        console.log(`📉 Top 5 coin giảm mạnh nhất: ${usdtCoins.slice(0, 5).map(coin => `${coin.symbol}(${coin.priceChangePercent.toFixed(2)}%)`).join(', ')}`);
        
        // Tạo dữ liệu mới bằng cách nhân bản template cho mỗi coin
        const generatedLines = [];
        
        for (const coin of usdtCoins) {
            for (const templateLine of templateLines) {
                // Parse dòng template
                const columns = templateLine.split(',');
                
                // Thay thế symbol ở cột thứ 5 (index 4) với format mới
                if (columns.length > 4) {
                    // Chuyển đổi từ BTCUSDT thành BTC_USDT
                    const formattedSymbol = coin.symbol.replace('USDT', '_USDT');
                    columns[4] = formattedSymbol;
                }
                
                // Tạo dòng mới
                const newLine = columns.join(',');
                generatedLines.push(newLine);
            }
        }
        
        console.log(`📊 Đã tạo ${generatedLines.length} dòng strategy`);
        
        // Tạo nội dung CSV
        const csvContent = generatedLines.join('\n');
        
        // Set headers cho download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `strategy_OC_thap_${timestamp}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
        
        res.send(csvContent);
        
        console.log(`✅ Đã tạo file OC thấp thành công: ${generatedLines.length} strategies, filename: ${filename}`);
        
    } catch (error) {
        console.error('❌ Lỗi khi tạo file OC thấp:', error);
        res.status(500).json({ 
            error: 'Lỗi khi tạo file OC thấp', 
            message: error.message 
        });
    }
});

// Automation Routes
app.use('/api/automation', automationRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi tạo dữ liệu khi server start
fetchMEXCFuturesData();

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log('Đang cập nhật dữ liệu từ MEXC...');
});
