class MEXCMonitor {
    constructor() {
        this.currentData = [];
        this.currentFilters = {};
        this.currentSort = { by: 'symbol', order: 'asc' };
        this.currentExchange = 'mexc';
    }

    updateExchangeTheme() {
        // Remove existing exchange classes
        document.body.classList.remove('exchange-mexc', 'exchange-gateio');
        
        // Add current exchange class
        document.body.classList.add(`exchange-${this.currentExchange}`);
        
        // Update page title
        const title = document.querySelector('h1');
        if (title) {
            const exchangeName = this.currentExchange === 'mexc' ? 'MEXC' : 'Gate.io';
            const icon = this.currentExchange === 'mexc' ? '🔥' : '🚪';
            title.innerHTML = `<i class="fas fa-chart-line"></i> ${icon} ${exchangeName} Futures Monitor`;
        }

        // Update exchange links highlighting
        this.updateExchangeLinks();
    }

    updateExchangeLinks() {
        const mexcLink = document.getElementById('mexcLink');
        const gateioLink = document.getElementById('gateioLink');
        
        if (mexcLink && gateioLink) {
            // Reset all links
            mexcLink.style.opacity = '1';
            gateioLink.style.opacity = '1';
            mexcLink.style.pointerEvents = 'auto';
            gateioLink.style.pointerEvents = 'auto';
            
            // Highlight current exchange link
            if (this.currentExchange === 'mexc') {
                gateioLink.style.opacity = '0.6';
                gateioLink.style.pointerEvents = 'none';
            } else {
                mexcLink.style.opacity = '0.6';
                mexcLink.style.pointerEvents = 'none';
            }
        }
    }

    // Khởi tạo khi DOM sẵn sàng
    static init() {
        const monitor = new MEXCMonitor();
        monitor.init();
        return monitor;
    }

    async init() {
        this.bindEvents();
        this.updateExchangeTheme(); // Apply initial theme
        await this.loadData();
        this.startAutoRefresh();
    }

    bindEvents() {
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });

        // Filter buttons
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Sort
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort.by = e.target.value;
            this.applySort();
        });

        document.getElementById('sortOrder').addEventListener('click', () => {
            this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
            this.updateSortButton();
            this.applySort();
        });

        // Export Excel
        document.getElementById('exportExcel').addEventListener('click', () => {
            this.exportToExcel(false); // Export dữ liệu đã filter
        });

        // Export All Excel
        document.getElementById('exportAllExcel').addEventListener('click', () => {
            this.exportToExcel(true); // Export tất cả dữ liệu
        });

        // Export Low OC
        document.getElementById('exportLowOC').addEventListener('click', () => {
            this.exportLowOC();
        });

        // Upload Template
        document.getElementById('uploadTemplate').addEventListener('click', () => {
            document.getElementById('templateFile').click();
        });

        // Handle file selection
        document.getElementById('templateFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.uploadTemplate(e.target.files[0]);
            }
        });

        // Exchange selector
        document.getElementById('exchangeSelect').addEventListener('change', (e) => {
            this.currentExchange = e.target.value;
            this.updateExchangeTheme();
            this.loadData();
        });
    }

    async loadData() {
        try {
            // Hiển thị trạng thái loading
            this.showLoading();
            
            // Kiểm tra kết nối mạng
            if (!navigator.onLine) {
                throw new Error('Không có kết nối internet');
            }
            
            // Kiểm tra trạng thái server
            const serverStatus = await this.checkServerStatus();
            if (!serverStatus) {
                throw new Error('Server không phản hồi');
            }
            
            console.log(`Đang tải dữ liệu từ server cho ${this.currentExchange}...`);
            const [futuresResponse, statsResponse] = await Promise.all([
                fetch(`/api/futures?exchange=${this.currentExchange}`),
                fetch(`/api/stats?exchange=${this.currentExchange}`)
            ]);

            console.log('Response status:', { futures: futuresResponse.status, stats: statsResponse.status });

            if (futuresResponse.ok && statsResponse.ok) {
                const futuresData = await futuresResponse.json();
                const statsData = await statsResponse.json();

                console.log('Dữ liệu nhận được:', { 
                    futuresCount: futuresData.data?.length || 0, 
                    stats: statsData 
                });

                this.currentData = futuresData.data;
                this.updateTable();
                this.updateStats(statsData);
                this.updateTopPerformers(statsData);
                this.updateLastUpdate(futuresData.lastUpdate);
                
                // Ẩn loading và hiển thị thành công
                this.hideLoading();
                console.log(`Đã tải thành công ${this.currentData.length} coins`);
            } else {
                throw new Error(`HTTP error! futures: ${futuresResponse.status}, stats: ${statsResponse.status}`);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            this.showError('Không thể tải dữ liệu từ server: ' + error.message);
            this.hideLoading();
            
            // Hiển thị thông báo lỗi trong bảng
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>Không thể tải dữ liệu</div>
                        <div class="error-details">${error.message}</div>
                        <div class="debug-info">
                            <small>Server: ${window.location.hostname}:${window.location.port || 80}</small><br>
                            <small>Thời gian: ${new Date().toLocaleString('vi-VN')}</small>
                        </div>
                        <button onclick="location.reload()" class="btn btn-primary">
                            <i class="fas fa-refresh"></i> Thử lại
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    applyFilters() {
        const minPriceChange = document.getElementById('minPriceChange').value;
        const maxPriceChange = document.getElementById('maxPriceChange').value;
        const minVolume = document.getElementById('minVolume').value;
        const maxVolume = document.getElementById('maxVolume').value;
        const minMarketCap = document.getElementById('minMarketCap').value;
        const maxMarketCap = document.getElementById('maxMarketCap').value;

        this.currentFilters = {
            search: document.getElementById('searchInput').value,
            minPriceChange: minPriceChange || null,
            maxPriceChange: maxPriceChange || null,
            minVolume: minVolume || null,
            maxVolume: maxVolume || null,
            minMarketCap: minMarketCap || null,
            maxMarketCap: maxMarketCap || null
        };

        this.fetchFilteredData();
    }

    async fetchFilteredData() {
        try {
            const params = new URLSearchParams();
            
            if (this.currentFilters.search) {
                params.append('search', this.currentFilters.search);
            }
            if (this.currentFilters.minPriceChange) {
                params.append('minPriceChange', this.currentFilters.minPriceChange);
            }
            if (this.currentFilters.maxPriceChange) {
                params.append('maxPriceChange', this.currentFilters.maxPriceChange);
            }
            if (this.currentFilters.minVolume) {
                params.append('minVolume', this.currentFilters.minVolume);
            }
            if (this.currentFilters.maxVolume) {
                params.append('maxVolume', this.currentFilters.maxVolume);
            }
            if (this.currentFilters.minMarketCap) {
                params.append('minMarketCap', this.currentFilters.minMarketCap);
            }
            if (this.currentFilters.maxMarketCap) {
                params.append('maxMarketCap', this.currentFilters.maxMarketCap);
            }

            params.append('sortBy', this.currentSort.by);
            params.append('sortOrder', this.currentSort.order);
            params.append('exchange', this.currentExchange);

            const response = await fetch(`/api/futures?${params}`);
            if (response.ok) {
                const data = await response.json();
                this.currentData = data.data;
                this.updateTable();
                this.updateResultsCount(data.total);
            }
        } catch (error) {
            console.error('Lỗi khi filter dữ liệu:', error);
        }
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('minPriceChange').value = '';
        document.getElementById('maxPriceChange').value = '';
        document.getElementById('minVolume').value = '';
        document.getElementById('maxVolume').value = '';
        document.getElementById('minMarketCap').value = '';
        document.getElementById('maxMarketCap').value = '';

        this.currentFilters = {};
        this.fetchFilteredData();
    }

    applySort() {
        this.fetchFilteredData();
    }

    updateSortButton() {
        const button = document.getElementById('sortOrder');
        const icon = button.querySelector('i');
        
        if (this.currentSort.order === 'asc') {
            icon.className = 'fas fa-sort-amount-up';
        } else {
            icon.className = 'fas fa-sort-amount-down';
        }
    }

    updateTable() {
        const tbody = document.getElementById('tableBody');
        
        if (this.currentData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">Không có dữ liệu</td></tr>';
            return;
        }

        tbody.innerHTML = this.currentData.map(coin => `
            <tr>
                <td>
                    <div class="coin-info">
                        <div>
                            <div class="coin-symbol">${coin.symbol}</div>
                            <div class="coin-base">${coin.baseAsset}</div>
                        </div>
                    </div>
                </td>
                <td>$${this.formatNumber(coin.price)}</td>
                <td>
                    <div class="price-change ${this.getPriceChangeClass(coin.priceChangePercent)}">
                        ${this.formatPriceChange(coin.priceChangePercent)}%
                    </div>
                </td>
                <td>${this.formatNumber(coin.volume)}</td>
                <td>$${this.formatNumber(coin.marketCap)}</td>
                <td>$${this.formatNumber(coin.high24h)}</td>
                <td>$${this.formatNumber(coin.low24h)}</td>
            </tr>
        `).join('');
    }

    updateStats(stats) {
        document.getElementById('totalCoins').textContent = this.formatNumber(stats.totalCoins);
        document.getElementById('totalMarketCap').textContent = `$${this.formatNumber(stats.totalMarketCap)}`;
        document.getElementById('avgPriceChange').textContent = `${stats.avgPriceChange.toFixed(2)}%`;
    }

    updateTopPerformers(stats) {
        this.updateTopList('topGainers', stats.topGainers, 'priceChangePercent', '%');
        this.updateTopList('topLosers', stats.topLosers, 'priceChangePercent', '%');
        this.updateTopList('highestVolume', stats.highestVolume, 'volume', '');
    }

    updateTopList(elementId, data, valueField, suffix) {
        const element = document.getElementById(elementId);
        
        if (data.length === 0) {
            element.innerHTML = '<div class="top-item">Không có dữ liệu</div>';
            return;
        }

        element.innerHTML = data.map(coin => `
            <div class="top-item">
                <span class="coin-name">${coin.symbol}</span>
                <span class="coin-value">
                    ${this.formatNumber(coin[valueField])}${suffix}
                </span>
            </div>
        `).join('');
    }

    updateLastUpdate(timestamp) {
        if (timestamp) {
            const date = new Date(timestamp);
            const formattedDate = date.toLocaleString('vi-VN');
            document.getElementById('lastUpdate').textContent = `Cập nhật lúc: ${formattedDate}`;
        }
    }

    updateResultsCount(count) {
        document.getElementById('resultsCount').textContent = count;
    }

    getPriceChangeClass(change) {
        if (change > 0) return 'positive';
        if (change < 0) return 'negative';
        return 'neutral';
    }

    formatNumber(num) {
        if (num === 0) return '0';
        if (num < 1) return num.toFixed(6);
        if (num < 1000) return num.toFixed(2);
        if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
        return (num / 1000000000).toFixed(2) + 'B';
    }

    formatPriceChange(change) {
        return change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
    }

    showError(message) {
        // Hiển thị thông báo lỗi
        this.showNotification(message, 'error');
        console.error(message);
    }

    showLoading() {
        // Hiển thị trạng thái loading trong bảng
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>';
        
        // Hiển thị loading trong stats
        document.getElementById('totalCoins').textContent = '...';
        document.getElementById('totalMarketCap').textContent = '...';
        document.getElementById('avgPriceChange').textContent = '...';
        
        // Hiển thị loading trong top performers
        document.getElementById('topGainers').innerHTML = '<div class="loading">Đang tải...</div>';
        document.getElementById('topLosers').innerHTML = '<div class="loading">Đang tải...</div>';
        document.getElementById('highestVolume').innerHTML = '<div class="loading">Đang tải...</div>';
    }

    hideLoading() {
        // Ẩn loading và cập nhật dữ liệu
        if (this.currentData.length > 0) {
            this.updateTable();
        }
    }

    async exportToExcel(exportAll = false) {
        try {
            // Hiển thị loading state
            const exportBtn = exportAll ? document.getElementById('exportAllExcel') : document.getElementById('exportExcel');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang export...';
            exportBtn.disabled = true;

            // Lấy dữ liệu để export
            const dataToExport = exportAll ? this.currentData : this.getFilteredData();
            
            if (!dataToExport || dataToExport.length === 0) {
                throw new Error('Không có dữ liệu để export');
            }
            
            // Tạo URL với query parameters
            const params = new URLSearchParams();
            
            // Thêm các filter hiện tại nếu không phải export tất cả
            if (!exportAll) {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    params.append('search', searchInput.value.trim());
                }
                
                const sortBySelect = document.getElementById('sortBy');
                if (sortBySelect) {
                    params.append('sortBy', sortBySelect.value);
                }
                
                const sortOrderSelect = document.getElementById('sortOrder');
                if (sortOrderSelect) {
                    params.append('sortOrder', sortOrderSelect.value);
                }
                
                // Thêm các filter range nếu có
                const minPriceChange = document.getElementById('minPriceChange');
                const maxPriceChange = document.getElementById('maxPriceChange');
                if (minPriceChange && minPriceChange.value) {
                    params.append('minPriceChange', minPriceChange.value);
                }
                if (maxPriceChange && maxPriceChange.value) {
                    params.append('maxPriceChange', maxPriceChange.value);
                }
                
                const minVolume = document.getElementById('minVolume');
                const maxVolume = document.getElementById('maxVolume');
                if (minVolume && minVolume.value) {
                    params.append('minVolume', minVolume.value);
                }
                if (maxVolume && maxVolume.value) {
                    params.append('maxVolume', maxVolume.value);
                }
                
                const minMarketCap = document.getElementById('minMarketCap');
                const maxMarketCap = document.getElementById('maxMarketCap');
                if (minMarketCap && minMarketCap.value) {
                    params.append('minMarketCap', minMarketCap.value);
                }
                if (maxMarketCap && maxMarketCap.value) {
                    params.append('maxMarketCap', maxMarketCap.value);
                }
            }
            
            // Thêm flag exportAll và exchange
            params.append('exportAll', exportAll.toString());
            params.append('exchange', this.currentExchange);
            
            // Tạo URL export
            const exportUrl = `/api/export/excel?${params.toString()}`;
            
            // Tạo link download và trigger
            const link = document.createElement('a');
            link.href = exportUrl;
            link.style.display = 'none';
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const exchangePrefix = this.currentExchange === 'gateio' ? 'gateio' : 'mexc';
            const filename = exportAll ? 
                `${exchangePrefix}-futures-all-${timestamp}.xlsx` : 
                `${exchangePrefix}-futures-filtered-${timestamp}.xlsx`;
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Khôi phục button
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            
            // Hiển thị thông báo thành công
            this.showSuccess(`✅ Đã export thành công ${dataToExport.length} records ra file ${filename}`);
            
        } catch (error) {
            console.error('Lỗi khi export Excel:', error);
            this.showError(error.message || 'Có lỗi xảy ra khi export Excel');
            
            // Khôi phục button
            const exportBtn = exportAll ? document.getElementById('exportAllExcel') : document.getElementById('exportExcel');
            const originalText = exportAll ? 
                '<i class="fas fa-download"></i> Export Tất cả' : 
                '<i class="fas fa-file-excel"></i> Export Excel';
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        }
    }

    async exportLowOC() {
        try {
            // Hiển thị loading state
            const exportBtn = document.getElementById('exportLowOC');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';
            exportBtn.disabled = true;

            // Gọi API để tạo file OC thấp
            const response = await fetch(`/api/export/low-oc?exchange=${this.currentExchange}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo file OC thấp');
            }

            // Tạo blob từ response
            const blob = await response.blob();
            
            // Tạo link download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.style.display = 'none';
            
            // Lấy filename từ response header hoặc tạo mới
            const contentDisposition = response.headers.get('Content-Disposition');
            const exchangePrefix = this.currentExchange === 'gateio' ? 'gateio' : 'mexc';
            let filename = `strategy_OC_thap_${exchangePrefix}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            
            // Khôi phục button
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            
            // Hiển thị thông báo thành công
            this.showSuccess(`✅ Đã tạo file OC thấp thành công: ${filename}`);
            
        } catch (error) {
            console.error('Lỗi khi tạo file OC thấp:', error);
            this.showError(error.message || 'Có lỗi xảy ra khi tạo file OC thấp');
            
            // Khôi phục button
            const exportBtn = document.getElementById('exportLowOC');
            const originalText = '<i class="fas fa-file-csv"></i> Tải OC thấp';
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        }
    }

    async uploadTemplate(file) {
        try {
            // Validate file type
            if (!file.name.endsWith('.csv')) {
                throw new Error('Vui lòng chọn file CSV');
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('File quá lớn. Kích thước tối đa là 10MB');
            }

            // Hiển thị loading state
            const uploadBtn = document.getElementById('uploadTemplate');
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            uploadBtn.disabled = true;

            // Tạo FormData
            const formData = new FormData();
            formData.append('template', file);
            formData.append('exchange', this.currentExchange);

            // Gọi API upload
            const response = await fetch('/api/upload-template', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Có lỗi xảy ra khi upload template');
            }

            // Tạo blob từ response
            const blob = await response.blob();
            
            // Tạo link download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.style.display = 'none';
            
            // Lấy filename từ response header
            const contentDisposition = response.headers.get('Content-Disposition');
            const exchangePrefix = this.currentExchange === 'gateio' ? 'gateio' : 'mexc';
            let filename = `strategy_OC_thap_upload_${exchangePrefix}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            
            // Reset file input
            document.getElementById('templateFile').value = '';
            
            // Khôi phục button
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
            
            // Hiển thị thông báo thành công
            this.showSuccess(`✅ Đã tạo file OC thấp từ template upload thành công: ${filename}`);
            
        } catch (error) {
            console.error('Lỗi khi upload template:', error);
            this.showError(error.message || 'Có lỗi xảy ra khi upload template');
            
            // Khôi phục button
            const uploadBtn = document.getElementById('uploadTemplate');
            const originalText = '<i class="fas fa-upload"></i> Upload Template';
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
            
            // Reset file input
            document.getElementById('templateFile').value = '';
        }
    }

    showSuccess(message) {
        // Hiển thị thông báo thành công
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Tạo notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Thêm vào body
        document.body.appendChild(notification);

        // Hiển thị notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    startAutoRefresh() {
        // Tự động refresh dữ liệu mỗi 5 phút
        setInterval(() => {
            this.loadData();
        }, 5 * 60 * 1000);
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`/api/futures?exchange=${this.currentExchange}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }



    async checkXLSXAndUpdateButtons() {
        try {
            // Đợi XLSX library với timeout ngắn hơn
            await this.waitForXLSX(5000);
            
            // Enable các button export
            const exportBtn = document.getElementById('exportExcel');
            const exportAllBtn = document.getElementById('exportAllExcel');
            
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.title = 'Export dữ liệu đã filter ra Excel';
            }
            
            if (exportAllBtn) {
                exportAllBtn.disabled = false;
                exportAllBtn.title = 'Export tất cả dữ liệu ra Excel';
            }
            
            console.log('✅ Các button export đã được enable');
            
            // Hiển thị thông báo thành công
            this.showSuccess('✅ Thư viện Excel đã sẵn sàng! Bạn có thể export dữ liệu.');
            
        } catch (error) {
            console.warn('⚠️ XLSX library chưa sẵn sàng, các button export sẽ bị disable');
            
            // Disable các button export
            const exportBtn = document.getElementById('exportExcel');
            const exportAllBtn = document.getElementById('exportAllExcel');
            
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.title = 'Đang tải thư viện Excel...';
            }
            
            if (exportAllBtn) {
                exportAllBtn.disabled = true;
                exportAllBtn.title = 'Đang tải thư viện Excel...';
            }
            
            // Thử lại sau 2 giây
            setTimeout(() => this.checkXLSXAndUpdateButtons(), 2000);
        }
    }
}

// Khởi tạo ứng dụng khi trang load xong
function initializeApp() {
    console.log('Initializing MEXC Monitor...');
    try {
        const monitor = MEXCMonitor.init();
        console.log('MEXC Monitor initialized successfully');
        return monitor;
    } catch (error) {
        console.error('Error initializing MEXC Monitor:', error);
        return null;
    }
}

// Đợi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM đã sẵn sàng
    initializeApp();
}

// Thêm loading state cho các button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        const originalText = e.target.innerHTML;
        e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        e.target.disabled = true;
        
        setTimeout(() => {
            e.target.innerHTML = originalText;
            e.target.disabled = false;
        }, 1000);
    }
});
