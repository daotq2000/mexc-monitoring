const fs = require('fs');
const path = require('path');
const axios = require('axios');
const XLSX = require('xlsx');

class StrategyGenerator {
    constructor() {
        this.config = this.loadConfig();
        this.ensureOutputDirectory();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'automation.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('❌ Lỗi khi load config:', error.message);
            return null;
        }
    }

    ensureOutputDirectory() {
        const outputDir = this.config?.output?.csvDirectory || './generated_strategies';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    async getVolatileCoins() {
        try {
            console.log('🔄 Đang lấy danh sách coin biến động...');
            
            // Sử dụng API local để lấy dữ liệu
            const params = new URLSearchParams({
                sortBy: this.config.automation.sortBy,
                sortOrder: this.config.automation.sortOrder,
                minPriceChange: this.config.automation.minPriceChangePercent,
                maxPriceChange: this.config.automation.maxPriceChangePercent,
                minVolume: this.config.automation.minVolume
            });

            const response = await axios.get(`http://localhost:3000/api/futures?${params}`);
            
            if (response.data && response.data.length > 0) {
                console.log(`📊 Đã lấy được ${response.data.length} coin USDT biến động`);
                return response.data;
            } else {
                console.log('⚠️ Không có dữ liệu coin nào');
                return [];
            }
            
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách coin:', error.message);
            return [];
        }
    }

    generateStrategyCSV(coins) {
        try {
            console.log('📝 Đang generate file CSV chiến lược...');
            
            const strategies = [];
            const template = this.config.csvTemplate;
            
            // Tạo các chiến lược với các giá trị OC khác nhau cho mỗi coin
            const ocValues = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
            
            coins.forEach(coin => {
                ocValues.forEach(oc => {
                    const strategy = {
                        _id: '',
                        externalId: '',
                        userId: template.userId,
                        userName: template.userName,
                        symbol: coin.symbol,
                        botId: template.botId,
                        botName: template.botName,
                        tradeType: template.tradeType,
                        interval: template.interval,
                        oc: oc,
                        ps: template.ps,
                        extend: template.extend,
                        amount: template.amount,
                        takeProfit: template.takeProfit,
                        reduceTp: template.reduceTp,
                        upReduce: template.upReduce,
                        ignore: template.ignore,
                        cs: template.cs,
                        win: template.win,
                        lose: template.lose,
                        totalPnl: template.totalPnl,
                        isRunning: template.isRunning,
                        safeHourHistory: template.safeHourHistory,
                        __v: template.__v
                    };
                    strategies.push(strategy);
                });
            });

            // Tạo workbook và worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(strategies);
            
            // Đặt tên worksheet
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Auto Generated Strategies');
            
            // Tự động điều chỉnh cột
            const colWidths = [
                { wch: 8 },  // _id
                { wch: 12 }, // externalId
                { wch: 35 }, // userId
                { wch: 15 }, // userName
                { wch: 15 }, // symbol
                { wch: 25 }, // botId
                { wch: 15 }, // botName
                { wch: 8 },  // tradeType
                { wch: 8 },  // interval
                { wch: 8 },  // oc
                { wch: 8 },  // ps
                { wch: 8 },  // extend
                { wch: 10 }, // amount
                { wch: 12 }, // takeProfit
                { wch: 10 }, // reduceTp
                { wch: 10 }, // upReduce
                { wch: 10 }, // ignore
                { wch: 10 }, // cs
                { wch: 8 },  // win
                { wch: 8 },  // lose
                { wch: 10 }, // totalPnl
                { wch: 10 }, // isRunning
                { wch: 15 }, // safeHourHistory
                { wch: 8 }   // __v
            ];
            worksheet['!cols'] = colWidths;

            return workbook;
        } catch (error) {
            console.error('❌ Lỗi khi generate CSV:', error.message);
            return null;
        }
    }

    async saveStrategyFile(workbook, coins) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${this.config.output.filenamePrefix}_${coins.length}_coins_${timestamp}.xlsx`;
            const filepath = path.join(this.config.output.csvDirectory, filename);
            
            // Tạo buffer Excel
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });
            
            // Lưu file
            fs.writeFileSync(filepath, excelBuffer);
            
            console.log(`💾 Đã lưu file chiến lược: ${filename}`);
            console.log(`📁 Đường dẫn: ${filepath}`);
            
            return { filename, filepath };
        } catch (error) {
            console.error('❌ Lỗi khi lưu file:', error.message);
            return null;
        }
    }

    async uploadToThirdParty(filepath, filename) {
        if (!this.config.thirdPartyAPI.enabled || !this.config.thirdPartyAPI.baseUrl) {
            console.log('⚠️ API bên thứ 3 chưa được cấu hình, bỏ qua bước upload');
            return false;
        }

        try {
            console.log('🚀 Đang upload file lên API bên thứ 3...');
            
            // Đọc file
            const fileBuffer = fs.readFileSync(filepath);
            
            // Chuẩn bị data để upload
            // Note: FormData không có sẵn trong Node.js, sử dụng multipart/form-data thay thế
            const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2, 8);
            let body = '';
            
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
            body += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
            body += fileBuffer.toString('binary');
            body += `\r\n--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="timestamp"\r\n\r\n`;
            body += new Date().toISOString();
            body += `\r\n--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="coinCount"\r\n\r\n`;
            body += filename.split('_')[2]; // Lấy số lượng coin từ tên file
            body += `\r\n--${boundary}--\r\n`;
            
            const response = await axios.post(
                `${this.config.thirdPartyAPI.baseUrl}${this.config.thirdPartyAPI.endpoint}`,
                formData,
                {
                    headers: {
                        ...this.config.thirdPartyAPI.headers,
                        'Content-Type': `multipart/form-data; boundary=${boundary}`
                    }
                }
            );
            
            if (response.status === 200 || response.status === 201) {
                console.log('✅ Upload thành công lên API bên thứ 3');
                return true;
            } else {
                console.log('⚠️ Upload không thành công, status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Lỗi khi upload lên API bên thứ 3:', error.message);
            return false;
        }
    }

    async executeFullProcess() {
        try {
            console.log('🚀 Bắt đầu quy trình tự động generate chiến lược...');
            console.log(`⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`);
            
            // 1. Lấy danh sách coin biến động
            const volatileCoins = await this.getVolatileCoins();
            if (volatileCoins.length === 0) {
                console.log('❌ Không có coin nào để xử lý');
                return false;
            }
            
            // 2. Generate CSV chiến lược
            const workbook = this.generateStrategyCSV(volatileCoins);
            if (!workbook) {
                console.log('❌ Không thể generate CSV');
                return false;
            }
            
            // 3. Lưu file
            const fileInfo = await this.saveStrategyFile(workbook, volatileCoins);
            if (!fileInfo) {
                console.log('❌ Không thể lưu file');
                return false;
            }
            
            // 4. Upload lên API bên thứ 3
            const uploadSuccess = await this.uploadToThirdParty(fileInfo.filepath, fileInfo.filename);
            
            console.log('🎉 Hoàn thành quy trình tự động!');
            console.log(`📊 Tổng số chiến lược được tạo: ${volatileCoins.length * 12}`); // 12 OC values per coin
            console.log(`📁 File đã lưu: ${fileInfo.filename}`);
            console.log(`🌐 Upload API: ${uploadSuccess ? 'Thành công' : 'Thất bại'}`);
            
            return true;
        } catch (error) {
            console.error('❌ Lỗi trong quy trình tự động:', error.message);
            return false;
        }
    }
}

module.exports = StrategyGenerator;
