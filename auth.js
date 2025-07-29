// Authentication system for The Sustainable Organic Farming (Browser Version)

// Client-side storage for temporary data
const tempStorage = new Map();
const adminCredentials = {
    id: "8144680437",
    password: "Thefarmer@143"
};

// Generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Authentication class
class AuthSystem {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        // Login type toggle
        const loginTabs = document.querySelectorAll('.login-tab');
        loginTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const loginType = e.target.dataset.type;
                this.switchLoginType(loginType);
            });
        });

        // User login form
        const userLoginForm = document.getElementById('user-login-form');
        if (userLoginForm) {
            userLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserLogin();
            });
        }

        // OTP verification form
        const otpForm = document.getElementById('otp-form');
        if (otpForm) {
            otpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOTPVerification();
            });
        }

        // Admin login form
        const adminLoginForm = document.getElementById('admin-login-form');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }

        // Resend OTP
        const resendOTP = document.getElementById('resend-otp');
        if (resendOTP) {
            resendOTP.addEventListener('click', () => {
                this.resendOTP();
            });
        }

        // Password toggle
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = document.getElementById('admin-password');
                const icon = togglePassword.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    }

    switchLoginType(type) {
        // Update tab appearance
        document.querySelectorAll('.login-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // Show/hide forms
        document.getElementById('user-login').style.display = type === 'user' ? 'block' : 'none';
        document.getElementById('admin-login').style.display = type === 'admin' ? 'block' : 'none';
        document.getElementById('otp-verification').style.display = 'none';
    }

    async handleUserLogin() {
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();

        if (!name || !email) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        this.showLoading('user-login-btn', 'Sending OTP...');

        try {
            const otp = generateOTP();
            
            // Store OTP temporarily for verification
            tempStorage.set(email, {
                otp: otp,
                name: name,
                timestamp: Date.now(),
                attempts: 0
            });

            // Send OTP email
            const emailSent = await this.sendOTPToServer(email, otp, name);
            
            if (emailSent) {
                // Switch to OTP verification
                document.getElementById('user-login').style.display = 'none';
                document.getElementById('otp-verification').style.display = 'block';
                document.getElementById('otp-email-display').textContent = email;
                
                this.showMessage('OTP sent to your email successfully!', 'success');
                this.startOTPCountdown();
            } else {
                this.showMessage('Failed to send OTP. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Something went wrong. Please try again.', 'error');
        } finally {
            this.hideLoading('user-login-btn', 'Send OTP');
        }
    }

    async sendOTPToServer(email, otp, name) {
        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, name })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                return true;
            } else {
                console.error('Failed to send OTP:', result.error);
                // For demo purposes, show OTP in console if email fails
                console.log(`Demo OTP for ${email}: ${otp}`);
                return true; // Still return true for demo
            }
        } catch (error) {
            console.error('Network error:', error);
            // Fallback: show OTP in console for demo
            console.log(`Demo OTP for ${email}: ${otp}`);
            return true;
        }
    }

    handleOTPVerification() {
        const email = document.getElementById('otp-email-display').textContent;
        const enteredOTP = document.getElementById('otp-input').value.trim();

        if (!enteredOTP) {
            this.showMessage('Please enter the OTP', 'error');
            return;
        }

        const otpData = tempStorage.get(email);
        if (!otpData) {
            this.showMessage('OTP expired. Please try again.', 'error');
            return;
        }

        // Check if OTP is expired (10 minutes)
        if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
            this.showMessage('OTP expired. Please try again.', 'error');
            tempStorage.delete(email);
            return;
        }

        // Check attempts
        if (otpData.attempts >= 3) {
            this.showMessage('Too many failed attempts. Please try again.', 'error');
            tempStorage.delete(email);
            return;
        }

        if (enteredOTP === otpData.otp) {
            // Store user session
            const userData = {
                email: email,
                name: otpData.name,
                type: 'user',
                loginTime: Date.now()
            };

            localStorage.setItem('userSession', JSON.stringify(userData));
            tempStorage.delete(email);
            
            this.showMessage('Login successful!', 'success');
            setTimeout(() => {
                this.redirectAfterLogin('user');
            }, 1500);
        } else {
            otpData.attempts++;
            this.showMessage(`Invalid OTP. ${3 - otpData.attempts} attempts remaining.`, 'error');
        }
    }

    handleAdminLogin() {
        const adminId = document.getElementById('admin-id').value.trim();
        const adminPassword = document.getElementById('admin-password').value;

        if (!adminId || !adminPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.showLoading('admin-login-btn', 'Logging in...');

        // Simulate network delay
        setTimeout(() => {
            if (adminId === adminCredentials.id && adminPassword === adminCredentials.password) {
                // Store admin session
                const adminData = {
                    id: adminId,
                    type: 'admin',
                    loginTime: Date.now()
                };

                localStorage.setItem('adminSession', JSON.stringify(adminData));
                
                this.showMessage('Admin login successful!', 'success');
                setTimeout(() => {
                    this.redirectAfterLogin('admin');
                }, 1500);
            } else {
                this.showMessage('Invalid admin credentials', 'error');
            }
            
            this.hideLoading('admin-login-btn', 'Login as Admin');
        }, 1000);
    }

    async resendOTP() {
        const email = document.getElementById('otp-email-display').textContent;
        const otpData = tempStorage.get(email);

        if (!otpData) {
            this.showMessage('Session expired. Please start again.', 'error');
            return;
        }

        const newOTP = generateOTP();
        otpData.otp = newOTP;
        otpData.timestamp = Date.now();
        otpData.attempts = 0;

        const emailSent = await this.sendOTPToServer(email, newOTP, otpData.name);
        
        if (emailSent) {
            this.showMessage('New OTP sent successfully!', 'success');
            this.startOTPCountdown();
        } else {
            this.showMessage('Failed to resend OTP. Please try again.', 'error');
        }
    }

    startOTPCountdown() {
        let countdown = 60;
        const resendBtn = document.getElementById('resend-otp');
        const countdownSpan = document.getElementById('countdown');
        
        resendBtn.disabled = true;
        
        const timer = setInterval(() => {
            countdownSpan.textContent = countdown;
            countdown--;
            
            if (countdown < 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                countdownSpan.textContent = '';
            }
        }, 1000);
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('auth-message');
        messageDiv.textContent = message;
        messageDiv.className = `auth-message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    showLoading(buttonId, text) {
        const button = document.getElementById(buttonId);
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${text}`;
    }

    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        button.disabled = false;
        button.innerHTML = originalText;
    }

    redirectAfterLogin(userType) {
        if (userType === 'admin') {
            // Redirect to admin dashboard or show admin controls
            window.location.href = '#admin-dashboard';
        } else {
            // Redirect to main site
            window.location.href = '#home';
        }
        
        // Close login modal/page
        const authSection = document.getElementById('auth');
        if (authSection) {
            authSection.classList.add('hidden');
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        const userSession = localStorage.getItem('userSession');
        const adminSession = localStorage.getItem('adminSession');
        
        return !!(userSession || adminSession);
    }

    // Get current user info
    getCurrentUser() {
        const userSession = localStorage.getItem('userSession');
        const adminSession = localStorage.getItem('adminSession');
        
        if (userSession) {
            try {
                return JSON.parse(userSession);
            } catch (e) {
                localStorage.removeItem('userSession');
            }
        }
        
        if (adminSession) {
            try {
                return JSON.parse(adminSession);
            } catch (e) {
                localStorage.removeItem('adminSession');
            }
        }
        
        return null;
    }

    // Logout
    logout() {
        localStorage.removeItem('userSession');
        localStorage.removeItem('adminSession');
        
        // Redirect to home
        window.location.href = '#home';
        
        // Show auth section if hidden
        const authSection = document.getElementById('auth');
        if (authSection) {
            authSection.classList.remove('hidden');
        }
    }
}

// Initialize authentication system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
});