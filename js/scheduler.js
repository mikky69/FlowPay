// Payment Scheduling System for PayStream
class PaymentScheduler {
    constructor() {
        this.scheduledPayments = [];
        this.paymentIntervals = {
            weekly: 7 * 24 * 60 * 60 * 1000,      // 7 days
            biweekly: 14 * 24 * 60 * 60 * 1000,   // 14 days
            monthly: 30 * 24 * 60 * 60 * 1000       // 30 days
        };
        this.isSchedulerActive = false;
        this.schedulerInterval = null;
        
        this.init();
    }

    init() {
        this.loadScheduledPayments();
        this.startScheduler();
        this.setupEventListeners();
        
        // Set global reference
        window.paymentScheduler = this;
    }

    setupEventListeners() {
        // Manual trigger for payments
        document.getElementById('triggerPayments')?.addEventListener('click', () => {
            this.processScheduledPayments();
        });

        // Schedule settings
        document.getElementById('scheduleSettings')?.addEventListener('click', () => {
            this.showScheduleSettings();
        });
    }

    async loadScheduledPayments() {
        try {
            if (!window.flowPay?.currentCompany) return;

            const response = await fetch(`tables/payments?search=${window.flowPay.currentCompany.id}`);
            const data = await response.json();
            
            this.scheduledPayments = data.data || [];
            this.updateScheduleDisplay();
            
        } catch (error) {
            console.error('Load scheduled payments error:', error);
        }
    }

    updateScheduleDisplay() {
        const container = document.getElementById('scheduledPayments');
        if (!container) return;

        if (this.scheduledPayments.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-calendar-alt text-4xl mb-2"></i>
                    <p>No scheduled payments</p>
                </div>
            `;
            return;
        }

        const html = this.scheduledPayments.slice(0, 10).map(payment => `
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i class="fas fa-clock text-blue-600 text-sm"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">Payment #${payment.id.substring(0, 8)}</p>
                        <p class="text-sm text-gray-500">${new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-800">${payment.amount.toLocaleString()} MNEE</p>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${this.getPaymentStatusColor(payment.status)}">
                        ${payment.status}
                    </span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    getPaymentStatusColor(status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    startScheduler() {
        if (this.isSchedulerActive) return;

        // Check every hour for scheduled payments
        this.schedulerInterval = setInterval(() => {
            this.checkScheduledPayments();
        }, 60 * 60 * 1000); // 1 hour

        // Initial check
        this.checkScheduledPayments();
        this.isSchedulerActive = true;

        console.log('Payment scheduler started');
    }

    stopScheduler() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }
        this.isSchedulerActive = false;
        console.log('Payment scheduler stopped');
    }

    async checkScheduledPayments() {
        try {
            if (!payStream.currentCompany) return;

            const now = new Date();
            const nextPaymentDate = this.getNextPaymentDate(payStream.currentCompany.payment_schedule);
            
            // Check if it's time for the next payment
            if (now >= nextPaymentDate) {
                console.log('Scheduled payment time reached');
                await this.processScheduledPayments();
            }
            
        } catch (error) {
            console.error('Check scheduled payments error:', error);
        }
    }

    getNextPaymentDate(schedule) {
        const now = new Date();
        const interval = this.paymentIntervals[schedule];
        
        if (!interval) {
            throw new Error(`Invalid payment schedule: ${schedule}`);
        }

        // Calculate next payment date based on last payment
        const lastPayment = this.getLastPaymentDate();
        const nextPayment = new Date(lastPayment.getTime() + interval);
        
        return nextPayment;
    }

    getLastPaymentDate() {
        // Get the most recent payment date
        if (this.scheduledPayments.length > 0) {
            const dates = this.scheduledPayments
                .filter(p => p.status === 'completed')
                .map(p => new Date(p.payment_date));
            
            if (dates.length > 0) {
                return new Date(Math.max(...dates));
            }
        }

        // Default to company creation date or current date
        return window.flowPay?.currentCompany ? 
            new Date(window.flowPay.currentCompany.created_at) : 
            new Date();
    }

    async processScheduledPayments() {
        try {
            if (!window.flowPay?.currentCompany || !window.walletManager?.currentAccount) {
                throw new Error('Company or wallet not connected');
            }

            window.flowPay?.showLoading(true);
            
            const activeEmployees = window.flowPay?.employees?.filter(emp => emp.is_active) || [];
            const paymentPromises = [];
            
            for (const employee of activeEmployees) {
                const paymentPromise = this.processEmployeePayment(employee);
                paymentPromises.push(paymentPromise);
            }

            const results = await Promise.allSettled(paymentPromises);
            
            this.updatePaymentResults(results);
            window.flowPay?.showLoading(false);
            
            // Reload data
            window.flowPay?.loadEmployees();
            this.loadScheduledPayments();
            window.payStreamAnalytics?.loadBlockchainData();
            
        } catch (error) {
            console.error('Process scheduled payments error:', error);
            window.flowPay?.showLoading(false);
            window.flowPay?.showNotification('Failed to process payments', 'error');
        }
    }

    async processEmployeePayment(employee) {
        try {
            // Create payment record
            const paymentData = {
                id: payStream.generateId(),
                company_id: payStream.currentCompany.id,
                employee_id: employee.id,
                amount: employee.salary,
                payment_date: new Date().toISOString(),
                status: 'pending',
                payment_type: 'monthly'
            };

            // Save payment record
            await window.flowPay?.createRecord('payments', paymentData);

            // Simulate smart contract interaction
            const txHash = await this.simulateSmartContractPayment(employee);
            
            // Update payment with transaction hash
            paymentData.transaction_hash = txHash;
            paymentData.status = 'completed';
            
            await window.flowPay?.updateRecord('payments', paymentData.id, {
                transaction_hash: txHash,
                status: 'completed'
            });

            return {
                employee: employee.name,
                amount: employee.salary,
                status: 'success',
                transactionHash: txHash
            };

        } catch (error) {
            console.error(`Payment failed for ${employee.name}:`, error);
            
            // Update payment status to failed
            const paymentData = {
                id: window.flowPay?.generateId?.() || `pay_${Date.now()}`,
                company_id: window.flowPay?.currentCompany?.id,
                employee_id: employee.id,
                amount: employee.salary,
                payment_date: new Date().toISOString(),
                status: 'failed',
                payment_type: 'monthly'
            };

            await window.flowPay?.createRecord('payments', paymentData);

            return {
                employee: employee.name,
                amount: employee.salary,
                status: 'failed',
                error: error.message
            };
        }
    }

    async simulateSmartContractPayment(employee) {
        // Simulate a blockchain transaction
        // In production, this would be replaced with actual smart contract interaction
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
        
        // Generate a mock transaction hash
        const txHash = '0x' + Math.random().toString(16).substr(2, 64);
        
        // Simulate a small chance of failure (5%)
        if (Math.random() < 0.05) {
            throw new Error('Blockchain transaction failed');
        }
        
        return txHash;
    }

    updatePaymentResults(results) {
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success');
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed'));
        
        // Update success rate
        const successRate = results.length > 0 ? (successful.length / results.length * 100).toFixed(1) : 0;
        
        // Show notification
        if (failed.length === 0) {
            window.flowPay?.showNotification(`All ${successful.length} payments processed successfully!`, 'success');
        } else {
            window.flowPay?.showNotification(`${successful.length} payments successful, ${failed.length} failed`, 'warning');
        }

        // Update analytics
        this.updatePaymentAnalytics(successRate, successful.length, failed.length);
    }

    updatePaymentAnalytics(successRate, successfulCount, failedCount) {
        const successRateElement = document.getElementById('successRate');
        if (successRateElement) {
            successRateElement.textContent = `${successRate}%`;
            successRateElement.className = `font-semibold ${successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`;
        }

        // Update payment history
        payStreamAnalytics.loadBlockchainData();
    }

    scheduleBonusPayment(employeeId, amount, scheduledDate) {
        // Schedule a one-time bonus payment
        const bonusPayment = {
            id: payStream.generateId(),
            company_id: payStream.currentCompany.id,
            employee_id: employeeId,
            amount: amount,
            payment_date: scheduledDate,
            status: 'scheduled',
            payment_type: 'bonus'
        };

        return payStream.createRecord('payments', bonusPayment);
    }

    cancelScheduledPayment(paymentId) {
        return payStream.updateRecord('payments', paymentId, { status: 'cancelled' });
    }

    getPaymentScheduleStatus() {
        if (!payStream.currentCompany) return 'inactive';

        const nextPayment = this.getNextPaymentDate(payStream.currentCompany.payment_schedule);
        const now = new Date();
        
        if (now >= nextPayment) {
            return 'due';
        }

        const daysUntil = Math.ceil((nextPayment - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 7) {
            return 'upcoming';
        }

        return 'scheduled';
    }

    showScheduleSettings() {
        // Show modal for schedule settings
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                <h3 class="text-2xl font-semibold text-gray-800 mb-6">Payment Schedule Settings</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Payment Schedule</label>
                        <select id="scheduleSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Auto-schedule</label>
                        <label class="flex items-center">
                            <input type="checkbox" id="autoSchedule" class="mr-2" checked>
                            <span class="text-sm text-gray-600">Automatically process payments when due</span>
                        </label>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="paymentScheduler.saveScheduleSettings()" class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                            Save
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition duration-300">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set current values
        if (payStream.currentCompany) {
            document.getElementById('scheduleSelect').value = payStream.currentCompany.payment_schedule;
        }
    }

    saveScheduleSettings() {
        const newSchedule = document.getElementById('scheduleSelect').value;
        const autoSchedule = document.getElementById('autoSchedule').checked;

        // Update company settings
        payStream.updateRecord('companies', payStream.currentCompany.id, {
            payment_schedule: newSchedule
        }).then(() => {
            payStream.currentCompany.payment_schedule = newSchedule;
            this.showNotification('Schedule settings updated', 'success');
            
            // Close modal
            document.querySelector('.fixed.inset-0.bg-black\/50').remove();
            
        }).catch(error => {
            console.error('Save schedule settings error:', error);
            this.showNotification('Failed to update settings', 'error');
        });

        // Update scheduler settings
        if (autoSchedule) {
            this.startScheduler();
        } else {
            this.stopScheduler();
        }
    }

    showNotification(message, type) {
        payStream.showNotification(message, type);
    }

    // Cleanup
    destroy() {
        this.stopScheduler();
    }
}

// Initialize payment scheduler
const paymentScheduler = new PaymentScheduler();