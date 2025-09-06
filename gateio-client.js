const axios = require('axios');

class GateIOClient {
    constructor() {
        this.baseURL = 'https://api.gateio.ws';
        this.apiVersion = 'v4';
    }

    // Lấy dữ liệu futures contracts từ Gate.io
    async fetchFuturesData() {
        try {
            console.log('Đang lấy dữ liệu từ Gate.io Futures API...');
            
            // Lấy danh sách futures contracts USDT
            const response = await axios.get(`${this.baseURL}/api/${this.apiVersion}/futures/usdt/tickers`);
            
            if (response.data && Array.isArray(response.data)) {
                console.log(`Đã lấy được ${response.data.length} futures contracts từ Gate.io`);
                return this.convertGateIOData(response.data);
            } else {
                console.log('Không có dữ liệu từ Gate.io API');
                return [];
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu từ Gate.io API:', error.message);
            return [];
        }
    }

    // Chuyển đổi dữ liệu từ Gate.io format sang format chuẩn
    convertGateIOData(gateioData) {
        return gateioData.map(contract => {
            const baseAsset = contract.contract.replace('_USDT', '');
            const quoteAsset = 'USDT';
            
            return {
                symbol: contract.contract, // Giữ nguyên format BTC_USDT
                baseAsset: baseAsset,
                quoteAsset: quoteAsset,
                price: parseFloat(contract.last) || 0,
                priceChange: parseFloat(contract.change_price) || 0,
                priceChangePercent: parseFloat(contract.change_percentage) || 0, // Đã là phần trăm
                volume: parseFloat(contract.volume_24h) || 0,
                quoteVolume: parseFloat(contract.volume_24h_quote) || 0,
                marketCap: parseFloat(contract.volume_24h_quote) || 0, // Sử dụng volume quote làm market cap
                high24h: parseFloat(contract.high_24h) || 0,
                low24h: parseFloat(contract.low_24h) || 0,
                openPrice: parseFloat(contract.last) - parseFloat(contract.change_price) || 0,
                lastUpdate: new Date().toISOString()
            };
        });
    }

    // Lấy thông tin chi tiết về một contract cụ thể
    async getContractDetails(contract) {
        try {
            const response = await axios.get(`${this.baseURL}/api/${this.apiVersion}/futures/usdt/contracts/${contract}`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin contract ${contract}:`, error.message);
            return null;
        }
    }

    // Lấy lịch sử giá của một contract
    async getPriceHistory(contract, interval = '1m', limit = 100) {
        try {
            const response = await axios.get(`${this.baseURL}/api/${this.apiVersion}/futures/usdt/candlesticks`, {
                params: {
                    contract: contract,
                    interval: interval,
                    limit: limit
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi lấy lịch sử giá ${contract}:`, error.message);
            return [];
        }
    }
}

module.exports = GateIOClient;
