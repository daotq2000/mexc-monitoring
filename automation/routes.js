const express = require('express');
const router = express.Router();
const StrategyGenerator = require('./strategyGenerator');
const AutomationScheduler = require('./scheduler');
const path = require('path');
const fs = require('fs');

// Khởi tạo scheduler
const scheduler = new AutomationScheduler();
const strategyGenerator = new StrategyGenerator();

// Middleware để kiểm tra xem scheduler có đang chạy không
const checkSchedulerStatus = (req, res, next) => {
    if (!scheduler) {
        return res.status(500).json({ error: 'Scheduler chưa được khởi tạo' });
    }
    next();
};

// GET /api/automation/status - Lấy trạng thái hệ thống tự động
router.get('/status', checkSchedulerStatus, (req, res) => {
    try {
        const status = scheduler.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy trạng thái',
            message: error.message
        });
    }
});

// POST /api/automation/start - Khởi động scheduler
router.post('/start', checkSchedulerStatus, (req, res) => {
    try {
        scheduler.start();
        res.json({
            success: true,
            message: 'Scheduler đã được khởi động thành công',
            data: scheduler.getStatus()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi khởi động scheduler',
            message: error.message
        });
    }
});

// POST /api/automation/stop - Dừng scheduler
router.post('/stop', checkSchedulerStatus, (req, res) => {
    try {
        scheduler.stop();
        res.json({
            success: true,
            message: 'Scheduler đã được dừng thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi dừng scheduler',
            message: error.message
        });
    }
});

// POST /api/automation/run-now - Chạy quy trình ngay lập tức
router.post('/run-now', checkSchedulerStatus, async (req, res) => {
    try {
        if (scheduler.isRunning) {
            return res.status(400).json({
                success: false,
                error: 'Quy trình đang chạy, vui lòng đợi hoàn thành'
            });
        }

        // Chạy quy trình trong background
        scheduler.runImmediately();
        
        res.json({
            success: true,
            message: 'Quy trình tự động đã được khởi chạy',
            data: {
                isRunning: true,
                startedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi chạy quy trình',
            message: error.message
        });
    }
});

// GET /api/automation/files - Lấy danh sách file đã generate
router.get('/files', (req, res) => {
    try {
        const config = strategyGenerator.config;
        const outputDir = config?.output?.csvDirectory || './generated_strategies';
        
        if (!fs.existsSync(outputDir)) {
            return res.json({
                success: true,
                data: [],
                message: 'Thư mục output chưa tồn tại'
            });
        }

        const files = fs.readdirSync(outputDir)
            .filter(file => file.endsWith('.xlsx'))
            .map(file => {
                const filePath = path.join(outputDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    path: filePath
                };
            })
            .sort((a, b) => b.modified - a.modified); // Sắp xếp theo thời gian sửa đổi mới nhất

        res.json({
            success: true,
            data: files,
            count: files.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy danh sách file',
            message: error.message
        });
    }
});

// GET /api/automation/files/:filename - Download file
router.get('/files/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const config = strategyGenerator.config;
        const outputDir = config?.output?.csvDirectory || './generated_strategies';
        const filePath = path.join(outputDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File không tồn tại'
            });
        }

        res.download(filePath, filename);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi download file',
            message: error.message
        });
    }
});

// DELETE /api/automation/files/:filename - Xóa file
router.delete('/files/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const config = strategyGenerator.config;
        const outputDir = config?.output?.csvDirectory || './generated_strategies';
        const filePath = path.join(outputDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File không tồn tại'
            });
        }

        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: `File ${filename} đã được xóa thành công`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi xóa file',
            message: error.message
        });
    }
});

// GET /api/automation/config - Lấy cấu hình hiện tại
router.get('/config', (req, res) => {
    try {
        const config = strategyGenerator.config;
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy cấu hình',
            message: error.message
        });
    }
});

// POST /api/automation/config - Cập nhật cấu hình
router.post('/config', (req, res) => {
    try {
        const newConfig = req.body;
        const configPath = path.join(__dirname, '..', 'config', 'automation.json');
        
        // Validate config
        if (!newConfig.automation || !newConfig.csvTemplate) {
            return res.status(400).json({
                success: false,
                error: 'Cấu hình không hợp lệ'
            });
        }

        // Lưu config mới
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        
        // Reload config trong strategy generator
        strategyGenerator.config = newConfig;
        
        res.json({
            success: true,
            message: 'Cấu hình đã được cập nhật thành công',
            data: newConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi cập nhật cấu hình',
            message: error.message
        });
    }
});

module.exports = router;
