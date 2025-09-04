const cron = require('node-cron');
const StrategyGenerator = require('./strategyGenerator');
const path = require('path');

class AutomationScheduler {
    constructor() {
        this.strategyGenerator = new StrategyGenerator();
        this.config = this.strategyGenerator.config;
        this.isRunning = false;
        this.lastRun = null;
        this.nextRun = null;
        this.runCount = 0;
    }

    start() {
        if (!this.config || !this.config.automation.enabled) {
            console.log('⚠️ Tự động hóa đã bị tắt trong config');
            return;
        }

        const intervalHours = this.config.automation.intervalHours;
        const cronExpression = `0 */${intervalHours} * * *`; // Chạy mỗi n giờ
        
        console.log(`🚀 Khởi động scheduler tự động hóa...`);
        console.log(`⏰ Interval: ${intervalHours} giờ (${cronExpression})`);
        console.log(`📊 Số coin tối đa: ${this.config.automation.maxCoins}`);
        console.log(`📈 % thay đổi giá tối thiểu: ${this.config.automation.minPriceChangePercent}%`);
        console.log(`📉 % thay đổi giá tối đa: ${this.config.automation.maxPriceChangePercent}%`);
        console.log(`💰 Volume tối thiểu: ${this.config.automation.minVolume.toLocaleString()}`);
        
        // Chạy ngay lần đầu
        this.scheduleNextRun();
        this.runImmediately();
        
        // Lên lịch chạy tự động
        cron.schedule(cronExpression, () => {
            this.runScheduled();
        });
        
        console.log(`✅ Scheduler đã được khởi động thành công!`);
        console.log(`🔄 Lần chạy tiếp theo: ${this.nextRun.toLocaleString('vi-VN')}`);
    }

    scheduleNextRun() {
        const now = new Date();
        const intervalMs = this.config.automation.intervalHours * 60 * 60 * 1000;
        this.nextRun = new Date(now.getTime() + intervalMs);
    }

    async runImmediately() {
        if (this.isRunning) {
            console.log('⚠️ Quy trình đang chạy, bỏ qua lần chạy ngay lập tức');
            return;
        }
        
        console.log('🚀 Chạy quy trình tự động ngay lập tức...');
        // Sử dụng setTimeout với delay ngắn để tránh blocking
        setTimeout(() => {
            this.executeProcess();
        }, 1000);
    }

    async runScheduled() {
        if (this.isRunning) {
            console.log('⚠️ Quy trình đang chạy, bỏ qua lần chạy theo lịch');
            return;
        }
        
        console.log('⏰ Chạy quy trình tự động theo lịch...');
        await this.executeProcess();
    }

    async executeProcess() {
        try {
            this.isRunning = true;
            this.lastRun = new Date();
            
            console.log(`\n🔄 Lần chạy thứ ${++this.runCount}`);
            console.log(`⏰ Thời gian bắt đầu: ${this.lastRun.toLocaleString('vi-VN')}`);
            
            // Thực hiện quy trình tự động
            const success = await this.strategyGenerator.executeFullProcess();
            
            if (success) {
                console.log(`✅ Lần chạy thứ ${this.runCount} thành công!`);
            } else {
                console.log(`❌ Lần chạy thứ ${this.runCount} thất bại!`);
            }
            
        } catch (error) {
            console.error(`❌ Lỗi trong lần chạy thứ ${this.runCount}:`, error.message);
        } finally {
            this.isRunning = false;
            this.scheduleNextRun();
            
            console.log(`⏰ Lần chạy tiếp theo: ${this.nextRun.toLocaleString('vi-VN')}`);
            console.log(`📊 Trạng thái: ${this.isRunning ? 'Đang chạy' : 'Sẵn sàng'}\n`);
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            nextRun: this.nextRun,
            runCount: this.runCount,
            config: this.config?.automation
        };
    }

    stop() {
        console.log('🛑 Dừng scheduler tự động hóa...');
        // Cron sẽ tự động dừng khi process kết thúc
    }
}

module.exports = AutomationScheduler;
