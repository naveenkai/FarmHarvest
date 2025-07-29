// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    async init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.updateCartCount();
        // Ensure category filters start in default state
        this.resetCategoryFilters();
        // Initialize hero carousel
        this.initHeroCarousel();
        // Load products from database
        await this.loadProducts();
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                this.products = await response.json();
                this.renderProducts();
                this.renderFeaturedProducts();
                this.updateProductEventListeners();
            } else {
                console.error('Failed to load products');
                showNotification('Failed to load products', 'error');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            showNotification('Error loading products', 'error');
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.showSection(targetId);
            });
        });

        // Mobile menu toggle - Fixed functionality
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            console.log('Mobile menu elements found, setting up event listeners');
            mobileMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
                console.log('Mobile menu toggled, hidden class:', mobileMenu.classList.contains('hidden'));
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                }
            });

            // Close mobile menu when clicking nav links
            document.querySelectorAll('#mobile-menu .nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                });
            });
        } else {
            console.log('Mobile menu elements not found:', { mobileMenuButton, mobileMenu });
        }

        // Cart sidebar toggle
        document.getElementById('cart-toggle').addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('mobile-cart-toggle').addEventListener('click', () => {
            this.toggleCart();
        });

        // Hero cart toggle
        document.getElementById('hero-cart-toggle').addEventListener('click', () => {
            this.toggleCart();
        });

        // Back to home button
        document.getElementById('back-to-home').addEventListener('click', () => {
            this.showSection('home');
        });

        // Cart card buttons
        document.getElementById('order-now-btn').addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('view-cart-from-order').addEventListener('click', () => {
            // Continue shopping - do nothing, just close any open modals
            this.closeCart();
        });

        document.getElementById('close-cart').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('cart-overlay').addEventListener('click', () => {
            this.closeCart();
        });

        // Checkout button
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.checkout();
        });

        // Contact form
        const contactForm = document.querySelector('#contact form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(contactForm);
            });
        }

        // User login functionality
        const userLoginBtns = document.querySelectorAll('#user-login-btn, #mobile-user-login-btn');
        userLoginBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showUserLoginModal();
                });
            }
        });

        // Admin login functionality
        const adminLoginBtns = document.querySelectorAll('#admin-login-btn, #mobile-admin-btn');
        adminLoginBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showAdminLoginModal();
                });
            }
        });

        // Admin login modal events
        const adminLoginModal = document.getElementById('admin-login-modal');
        const closeAdminModal = document.getElementById('close-admin-modal');
        const cancelAdminLogin = document.getElementById('cancel-admin-login');
        const adminLoginForm = document.getElementById('admin-login-form');

        if (closeAdminModal) {
            closeAdminModal.addEventListener('click', () => {
                this.hideAdminLoginModal();
            });
        }

        if (cancelAdminLogin) {
            cancelAdminLogin.addEventListener('click', () => {
                this.hideAdminLoginModal();
            });
        }

        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }

        if (adminLoginModal) {
            adminLoginModal.addEventListener('click', (e) => {
                if (e.target.id === 'admin-login-modal') {
                    this.hideAdminLoginModal();
                }
            });
        }

        // User profile functionality  
        this.initUserProfileEvents();
        this.checkUserSession();
        this.updateProductEventListeners();
    }

    initUserProfileEvents() {
        // Profile menu toggle
        const profileMenuBtn = document.getElementById('profile-menu-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        if (profileMenuBtn) {
            profileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('hidden');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (profileDropdown) {
                profileDropdown.classList.add('hidden');
            }
        });

        // Tab switching in login modal
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');

        if (loginTab && registerTab) {
            loginTab.addEventListener('click', () => {
                this.switchToLoginTab();
            });

            registerTab.addEventListener('click', () => {
                this.switchToRegisterTab();
            });
        }

        // Form submissions
        const userLoginForm = document.getElementById('user-login-form');
        const userRegisterForm = document.getElementById('user-register-form');
        const otpForm = document.getElementById('otp-form');
        const profileEditForm = document.getElementById('profile-edit-form');

        if (userLoginForm) {
            userLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserLogin();
            });
        }

        if (userRegisterForm) {
            userRegisterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUserRegister();
            });
        }

        if (otpForm) {
            otpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOTPVerification();
            });
        }

        if (profileEditForm) {
            profileEditForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate();
            });
        }

        // Modal close events
        this.setupModalCloseEvents();
        
        // Profile actions
        this.setupProfileActions();
        
        // Photo selection
        this.setupPhotoSelection();
    }

    setupModalCloseEvents() {
        const modals = [
            { modal: '#user-login-modal', close: '#close-user-modal', method: 'hideUserLoginModal' },
            { modal: '#otp-modal', close: '#close-otp-modal', method: 'hideOTPModal' },
            { modal: '#profile-edit-modal', close: '#close-profile-modal', method: 'hideProfileEditModal' },
            { modal: '#photo-selection-modal', close: '#close-photo-modal', method: 'hidePhotoSelectionModal' }
        ];

        modals.forEach(({ modal, close, method }) => {
            const modalEl = document.querySelector(modal);
            const closeBtn = document.querySelector(close);
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this[method]());
            }
            
            if (modalEl) {
                modalEl.addEventListener('click', (e) => {
                    if (e.target === modalEl) {
                        this[method]();
                    }
                });
            }
        });
    }

    setupProfileActions() {
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const changePhotoBtn = document.getElementById('change-photo-btn');
        const userLogoutBtn = document.getElementById('user-logout-btn');
        const cancelProfileEdit = document.getElementById('cancel-profile-edit');
        const changeProfilePicBtn = document.getElementById('change-profile-pic-btn');
        const resendOtpBtn = document.getElementById('resend-otp');

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showProfileEditModal());
        }

        if (changePhotoBtn) {
            changePhotoBtn.addEventListener('click', () => this.showPhotoSelectionModal());
        }

        if (userLogoutBtn) {
            userLogoutBtn.addEventListener('click', () => this.handleUserLogout());
        }

        if (cancelProfileEdit) {
            cancelProfileEdit.addEventListener('click', () => this.hideProfileEditModal());
        }

        if (changeProfilePicBtn) {
            changeProfilePicBtn.addEventListener('click', () => this.showPhotoSelectionModal());
        }

        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', () => this.resendOTP());
        }
    }

    setupPhotoSelection() {
        const photoOptions = document.querySelectorAll('.photo-option');
        const useCustomPhotoBtn = document.getElementById('use-custom-photo');
        const customPhotoUrl = document.getElementById('custom-photo-url');

        photoOptions.forEach(option => {
            option.addEventListener('click', () => {
                const photoUrl = option.dataset.photo;
                this.selectProfilePhoto(photoUrl);
            });
        });

        if (useCustomPhotoBtn) {
            useCustomPhotoBtn.addEventListener('click', () => {
                const photoUrl = customPhotoUrl.value.trim();
                if (photoUrl) {
                    this.selectProfilePhoto(photoUrl);
                }
            });
        }
    }

    updateProductEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.removeEventListener('click', this.handleAddToCart);
            button.addEventListener('click', this.handleAddToCart.bind(this));
        });

        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.dataset.action;
                const input = button.parentElement.querySelector('.quantity-input');
                let value = parseInt(input.value);
                
                if (action === 'increase' && value < 10) {
                    input.value = value + 1;
                } else if (action === 'decrease' && value > 1) {
                    input.value = value - 1;
                }
            });
        });

        // Product category filters
        document.querySelectorAll('.category-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = button.dataset.category;
                this.filterProducts(category);
                
                // Update active state
                document.querySelectorAll('.category-filter').forEach(btn => {
                    btn.classList.remove('active', 'bg-organic-green', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                
                button.classList.remove('bg-gray-200', 'text-gray-700');
                button.classList.add('active', 'bg-organic-green', 'text-white');
            });
        });
    }

    handleAddToCart(e) {
        const button = e.target;
        const productData = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            unit: button.dataset.unit,
            image: button.dataset.image
        };
        
        const quantityInput = button.closest('.product-card').querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value);
        
        this.addToCart(productData, quantity);
        this.showAddedFeedback(button);
    }

    renderProducts() {
        const productContainers = [
            { id: 'vegetables-grid', category: 'vegetables' },
            { id: 'fruits-grid', category: 'fruits' }, 
            { id: 'moringa-grid', category: 'moringa' }
        ];

        productContainers.forEach(container => {
            const grid = document.getElementById(container.id);
            if (grid) {
                const categoryProducts = this.products.filter(p => p.category === container.category);
                grid.innerHTML = '';
                
                categoryProducts.forEach(product => {
                    const productCard = this.createProductCard(product);
                    grid.appendChild(productCard);
                });
            }
        });
    }

    renderFeaturedProducts() {
        const featuredGrid = document.getElementById('featured-products-grid');
        if (!featuredGrid) return;

        const featuredProducts = this.products.filter(p => p.featured);
        featuredGrid.innerHTML = '';

        featuredProducts.forEach(product => {
            const productCard = this.createFeaturedProductCard(product);
            featuredGrid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-organic-brown mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xl font-bold text-organic-green">₹${product.price}/${product.unit}</span>
                    <span class="text-sm text-gray-500">Stock: ${product.stock}</span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <button class="quantity-btn bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-l px-2 py-1" data-action="decrease">-</button>
                        <input type="number" class="quantity-input w-16 text-center border-t border-b border-gray-200 py-1" min="1" max="10" value="1">
                        <button class="quantity-btn bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r px-2 py-1" data-action="increase">+</button>
                    </div>
                    <button class="add-to-cart bg-organic-green hover:bg-opacity-90 text-white px-4 py-2 rounded transition" 
                            data-id="${product.id}" 
                            data-name="${product.name}" 
                            data-price="${product.price}" 
                            data-unit="${product.unit}" 
                            data-image="${product.image}">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    createFeaturedProductCard(product) {
        const card = document.createElement('div');
        card.className = 'featured-product-card bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-24 h-24 object-cover rounded-full mx-auto mb-4">
            <h3 class="text-lg font-semibold text-organic-brown mb-2">${product.name}</h3>
            <p class="text-organic-green font-bold">₹${product.price}/${product.unit}</p>
        `;
        
        // Add click handler to navigate to product category
        card.addEventListener('click', () => {
            this.showSection('products');
            setTimeout(() => {
                this.filterProducts(product.category);
            }, 100);
        });
        
        return card;
    }

    filterProducts(category) {
        if (!this.products) return;
        
        const allProducts = document.querySelectorAll('.product-card');
        allProducts.forEach(card => card.style.display = 'block');

        if (category === 'all') {
            // Show all products
            this.renderProducts();
        } else {
            // Hide all product grids first
            const grids = ['vegetables-grid', 'fruits-grid', 'moringa-grid'];
            grids.forEach(gridId => {
                const grid = document.getElementById(gridId);
                if (grid) {
                    grid.innerHTML = '';
                }
            });

            // Show only the selected category
            const categoryProducts = this.products.filter(p => p.category === category);
            const targetGridMap = {
                'vegetables': 'vegetables-grid',
                'fruits': 'fruits-grid', 
                'moringa': 'moringa-grid'
            };

            const targetGrid = document.getElementById(targetGridMap[category]);
            if (targetGrid) {
                categoryProducts.forEach(product => {
                    const productCard = this.createProductCard(product);
                    targetGrid.appendChild(productCard);
                });
                this.updateProductEventListeners();
            }
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Reset category filters when not in products section
        if (sectionId !== 'products') {
            this.resetCategoryFilters();
        }

        // Close mobile menu
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navigateToCategory(category) {
        // First navigate to products section
        this.showSection('products');
        
        // Then filter to the specific category
        setTimeout(() => {
            this.filterProducts(category);
            
            // Update active state of category filters
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.classList.remove('active', 'bg-organic-green', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            // Find and activate the correct category button
            const categoryButton = document.querySelector(`[data-category="${category}"]`);
            if (categoryButton) {
                categoryButton.classList.remove('bg-gray-200', 'text-gray-700');
                categoryButton.classList.add('active', 'bg-organic-green', 'text-white');
            }
            
            // Scroll to products grid
            const productsGrid = document.getElementById('products-grid');
            if (productsGrid) {
                productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    resetCategoryFilters() {
        // Force reset all category filters to default state
        document.querySelectorAll('.category-filter').forEach(btn => {
            // Remove all possible active classes
            btn.classList.remove('active', 'bg-organic-green', 'text-white');
            // Add default classes
            btn.classList.add('bg-gray-200', 'text-gray-700');
            // Remove any inline styles that might be causing issues
            btn.style.backgroundColor = '';
            btn.style.color = '';
        });
        
        // Set "All Products" as active
        const allProductsBtn = document.querySelector('[data-category="all"]');
        if (allProductsBtn) {
            allProductsBtn.classList.remove('bg-gray-200', 'text-gray-700');
            allProductsBtn.classList.add('active', 'bg-organic-green', 'text-white');
        }
    }

    showAdminLoginModal() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideAdminLoginModal() {
        const modal = document.getElementById('admin-login-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            // Reset form
            const form = document.getElementById('admin-login-form');
            if (form) form.reset();
        }
    }

    async handleAdminLogin() {
        const adminId = document.getElementById('admin-id').value;
        const password = document.getElementById('admin-password').value;

        try {
            const response = await fetch('/api/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ adminId, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store session info and redirect to admin panel
                document.cookie = `sessionId=${data.sessionId}; path=/`;
                showNotification('Admin login successful!', 'success');
                this.hideAdminLoginModal();
                
                // Redirect to admin panel
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);
            } else {
                showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showNotification('Login failed. Please try again.', 'error');
        }
    }

    // User Profile Methods
    showUserLoginModal() {
        const modal = document.getElementById('user-login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            this.switchToLoginTab();
        }
    }

    hideUserLoginModal() {
        const modal = document.getElementById('user-login-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            this.resetUserForms();
        }
    }

    showOTPModal() {
        this.hideUserLoginModal();
        const modal = document.getElementById('otp-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideOTPModal() {
        const modal = document.getElementById('otp-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            document.getElementById('otp-form').reset();
        }
    }

    showProfileEditModal() {
        const modal = document.getElementById('profile-edit-modal');
        if (modal) {
            this.populateProfileEditForm();
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        this.hideProfileDropdown();
    }

    hideProfileEditModal() {
        const modal = document.getElementById('profile-edit-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    showPhotoSelectionModal() {
        const modal = document.getElementById('photo-selection-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        this.hideProfileEditModal();
    }

    hidePhotoSelectionModal() {
        const modal = document.getElementById('photo-selection-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            document.getElementById('custom-photo-url').value = '';
        }
    }

    hideProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    switchToLoginTab() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form-container');
        const registerForm = document.getElementById('register-form-container');

        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.classList.add('border-organic-green', 'text-organic-green');
            loginTab.classList.remove('text-gray-500');
            
            registerTab.classList.remove('border-organic-green', 'text-organic-green');
            registerTab.classList.add('text-gray-500');
            
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        }
    }

    switchToRegisterTab() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form-container');
        const registerForm = document.getElementById('register-form-container');

        if (loginTab && registerTab && loginForm && registerForm) {
            registerTab.classList.add('border-organic-green', 'text-organic-green', 'border-b-2');
            registerTab.classList.remove('text-gray-500');
            
            loginTab.classList.remove('border-organic-green', 'text-organic-green', 'border-b-2');
            loginTab.classList.add('text-gray-500');
            
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    resetUserForms() {
        const forms = ['user-login-form', 'user-register-form'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.reset();
        });
    }

    async handleUserLogin() {
        const email = document.getElementById('login-email').value;
        const name = document.getElementById('login-name').value;
        
        try {
            const otp = this.generateOTP();
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, otp })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                this.currentUserData = { email, name, type: 'login' };
                this.showOTPModal();
                showNotification('OTP sent to your email!', 'success');
            } else {
                showNotification(data.error || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            console.error('User login error:', error);
            showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleUserRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        
        try {
            const otp = this.generateOTP();
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, otp })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                this.currentUserData = { email, name, phone, type: 'register' };
                this.showOTPModal();
                showNotification('OTP sent to your email!', 'success');
            } else {
                showNotification(data.error || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            console.error('User register error:', error);
            showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async handleOTPVerification() {
        const otp = document.getElementById('otp-input').value;
        
        if (!this.currentUserData) {
            showNotification('Session expired. Please try again.', 'error');
            this.hideOTPModal();
            return;
        }

        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: this.currentUserData.email,
                    otp: otp
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                this.handleSuccessfulLogin(data);
            } else {
                showNotification(data.error || 'Invalid OTP', 'error');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            showNotification('Verification failed. Please try again.', 'error');
        }
    }

    handleSuccessfulLogin(data) {
        const userData = {
            email: this.currentUserData.email,
            name: this.currentUserData.name,
            phone: this.currentUserData.phone || '',
            profilePic: this.generateDefaultProfilePic(this.currentUserData.name),
            sessionId: data.sessionId || 'user-session'
        };

        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Create session cookie
        const sessionId = userData.sessionId;
        document.cookie = `sessionId=${sessionId}; path=/; expires=${new Date(Date.now() + 24*60*60*1000).toUTCString()}`;

        // Show user profile
        this.displayUserProfile(userData);
        this.hideOTPModal();
        
        showNotification(`Welcome ${userData.name}!`, 'success');
        this.currentUserData = null;
    }

    displayUserProfile(userData) {
        // Update profile section
        const userProfileSection = document.getElementById('user-profile-section');
        const userGreeting = document.getElementById('user-greeting');
        const userName = document.getElementById('user-name');
        const userProfilePic = document.getElementById('user-profile-pic');
        
        if (userProfileSection && userGreeting && userName && userProfilePic) {
            userGreeting.textContent = this.getGreeting();
            userName.textContent = userData.name;
            userProfilePic.src = userData.profilePic;
            userProfileSection.classList.remove('hidden');
        }

        // Hide login buttons
        const loginBtns = document.querySelectorAll('#user-login-btn, #mobile-user-login-btn');
        loginBtns.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning!';
        if (hour < 17) return 'Good Afternoon!';
        return 'Good Evening!';
    }

    generateDefaultProfilePic(name) {
        const colors = ['4ade80', '059669', '0f766e', '92400e', 'be185d', '1e40af', '7c2d12', '374151'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=40`;
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async resendOTP() {
        if (!this.currentUserData) return;
        
        try {
            const otp = this.generateOTP();
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.currentUserData.email,
                    name: this.currentUserData.name,
                    otp: otp
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                showNotification('OTP resent successfully!', 'success');
            } else {
                showNotification('Failed to resend OTP', 'error');
            }
        } catch (error) {
            showNotification('Failed to resend OTP', 'error');
        }
    }

    populateProfileEditForm() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        document.getElementById('edit-name').value = userData.name || '';
        document.getElementById('edit-email').value = userData.email || '';
        document.getElementById('edit-phone').value = userData.phone || '';
        document.getElementById('preview-profile-pic').src = userData.profilePic || '';
    }

    async handleProfileUpdate() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedData = {
            ...userData,
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value
        };

        // Update local storage
        localStorage.setItem('userData', JSON.stringify(updatedData));
        
        // Update display
        this.displayUserProfile(updatedData);
        this.hideProfileEditModal();
        
        showNotification('Profile updated successfully!', 'success');
    }

    selectProfilePhoto(photoUrl) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.profilePic = photoUrl;
        
        // Update local storage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update all profile pictures
        const profilePics = document.querySelectorAll('#user-profile-pic, #preview-profile-pic');
        profilePics.forEach(pic => {
            if (pic) pic.src = photoUrl;
        });
        
        this.hidePhotoSelectionModal();
        showNotification('Profile photo updated!', 'success');
    }

    async checkUserSession() {
        const userData = JSON.parse(localStorage.getItem('userData') || 'null');
        if (userData && userData.sessionId) {
            // Check if session is still valid on server
            try {
                const response = await fetch('/api/check-session', {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    this.displayUserProfile(userData);
                } else {
                    // Session expired, clear local data
                    localStorage.removeItem('userData');
                    this.showLoginButtons();
                }
            } catch (error) {
                console.log('Session check failed, showing login');
                this.displayUserProfile(userData); // Show profile anyway for offline functionality
            }
        }
    }

    showLoginButtons() {
        const loginBtns = document.querySelectorAll('#user-login-btn, #mobile-user-login-btn');
        loginBtns.forEach(btn => {
            if (btn) btn.style.display = 'block';
        });
        
        const userProfileSection = document.getElementById('user-profile-section');
        if (userProfileSection) {
            userProfileSection.classList.add('hidden');
        }
    }

    async handleUserLogout() {
        try {
            // Notify server about logout
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.log('Server logout failed, continuing with client logout');
        }
        
        // Clear user data
        localStorage.removeItem('userData');
        document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        
        // Hide profile section
        const userProfileSection = document.getElementById('user-profile-section');
        if (userProfileSection) {
            userProfileSection.classList.add('hidden');
        }
        
        // Show login buttons
        this.showLoginButtons();
        this.hideProfileDropdown();
        showNotification('Logged out successfully!', 'success');
    }

    filterProducts(category) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    addToCart(product, quantity) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartCount();
            }
        }
    }

    updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty</p>';
            cartTotal.textContent = '₹0';
            return;
        }

        let html = '';
        let total = 0;

        this.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            html += `
                <div class="cart-item flex items-center space-x-3 mb-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                    <div class="flex-1">
                        <h4 class="font-bold text-organic-brown text-sm">${item.name}</h4>
                        <p class="text-gray-600 text-xs">₹${item.price}/${item.unit}</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <button class="cart-quantity-btn w-6 h-6 bg-gray-200 rounded text-xs" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="text-sm font-medium">${item.quantity}</span>
                            <button class="cart-quantity-btn w-6 h-6 bg-gray-200 rounded text-xs" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-organic-green text-sm">₹${itemTotal}</p>
                        <button class="text-red-500 text-xs hover:text-red-700" onclick="cart.removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotal.textContent = `₹${total}`;
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update cart count elements
        const cartCountElements = document.querySelectorAll('#cart-count, #mobile-cart-count, #hero-cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
            if (count > 0) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });

        // Update order card
        this.updateOrderCard(count, total);
    }

    updateOrderCard(count, total) {
        const orderCard = document.getElementById('order-now-card');
        const orderCardCount = document.getElementById('order-card-count');
        const orderCardTotal = document.getElementById('order-card-total');
        
        if (count > 0) {
            orderCard.classList.remove('hidden');
            orderCardCount.textContent = count;
            orderCardTotal.textContent = `₹${total}`;
        } else {
            orderCard.classList.add('hidden');
        }
    }

    processOrder() {
        if (this.items.length === 0) {
            alert('Your cart is empty! Please add some items before ordering.');
            return;
        }

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsList = this.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
        
        const orderDetails = `
🌱 ORDER CONFIRMATION 🌱

Thank you for choosing The Sustainable Organic Farming!

📦 Order Details:
${itemsList}

💰 Total Amount: ₹${total}

📞 Next Steps:
• Our team will contact you within 2 hours to confirm your order
• We'll arrange delivery at your preferred time
• Payment can be made upon delivery (Cash on Delivery)

📍 Delivery Areas: Within 10km of Lanjigarh, Odisha
🚚 Delivery Time: 7 AM - 12 PM or 3 PM - 7 PM
🆓 Free delivery on orders above ₹500

Thank you for supporting sustainable organic farming! 🌿
        `;
        
        alert(orderDetails);
        
        // Clear cart after successful order
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
        
        // Show success message
        setTimeout(() => {
            alert('🎉 Order placed successfully! We will contact you soon for delivery confirmation.');
        }, 500);
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        const isOpen = cartSidebar.classList.contains('cart-sidebar-open');
        
        if (isOpen) {
            this.closeCart();
        } else {
            cartSidebar.classList.add('cart-sidebar-open');
            cartOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        cartSidebar.classList.remove('cart-sidebar-open');
        cartOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    showAddedFeedback(button) {
        const originalText = button.innerHTML;
        button.classList.add('added');
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Added!';
        
        setTimeout(() => {
            button.classList.remove('added');
            button.innerHTML = originalText;
        }, 1500);
    }

    checkout() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsList = this.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
        
        const message = `Thank you for your order!\n\nItems: ${itemsList}\nTotal: ₹${total}\n\nWe will contact you shortly for delivery details.`;
        
        alert(message);
        
        // Clear cart after successful checkout
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartCount();
        this.closeCart();
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1500);
    }

    saveCart() {
        localStorage.setItem('organicFarmCart', JSON.stringify(this.items));
    }

    loadCart() {
        const saved = localStorage.getItem('organicFarmCart');
        return saved ? JSON.parse(saved) : [];
    }

    initHeroCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.carousel-indicator');
        let currentSlide = 0;
        let slideInterval;

        // Auto-slide functionality
        const nextSlide = () => {
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].classList.remove('active');
            
            currentSlide = (currentSlide + 1) % slides.length;
            
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
        };

        // Start auto-sliding every 4 seconds
        const startAutoSlide = () => {
            slideInterval = setInterval(nextSlide, 4000);
        };

        startAutoSlide();

        // Manual indicator clicks
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                // Clear the auto-slide timer
                clearInterval(slideInterval);
                
                // Update slides
                slides[currentSlide].classList.remove('active');
                indicators[currentSlide].classList.remove('active');
                
                currentSlide = index;
                
                slides[currentSlide].classList.add('active');
                indicators[currentSlide].classList.add('active');
                
                // Restart auto-sliding after 4 seconds
                setTimeout(startAutoSlide, 4000);
            });
        });

        // Pause on hover
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            
            heroSection.addEventListener('mouseleave', () => {
                startAutoSlide();
            });
        }
    }
}

// Product data for search and filtering
const productData = {
    tomatoes: {
        name: "Organic Tomatoes",
        category: "vegetables",
        benefits: ["27% higher vitamin C", "Rich in lycopene", "Antioxidant properties"],
        nutritionalInfo: "High in vitamin C, lycopene, and folate"
    },
    potatoes: {
        name: "Organic Potatoes",
        category: "vegetables",
        benefits: ["4x more vitamin B5 than tomatoes", "High in potassium", "Good source of fiber"],
        nutritionalInfo: "Rich in vitamin B5, potassium, and complex carbohydrates"
    },
    watermelon: {
        name: "Fresh Watermelon",
        category: "fruits",
        benefits: ["92% water content", "40% more lycopene than raw tomatoes", "Natural hydration"],
        nutritionalInfo: "High in lycopene, vitamin C, and natural sugars"
    },
    "moringa-powder": {
        name: "Moringa Powder",
        category: "moringa",
        benefits: ["90+ nutrients", "All 9 essential amino acids", "Immune system boost"],
        nutritionalInfo: "Complete protein source with vitamins A, C, and iron"
    },
    "moringa-tea": {
        name: "Moringa Tea Powder",
        category: "moringa",
        benefits: ["Antioxidant-rich", "Blood sugar control", "Heart health support"],
        nutritionalInfo: "Rich in antioxidants, polyphenols, and minerals"
    },
    "moringa-acchar": {
        name: "Moringa Acchar (Pickle)",
        category: "moringa",
        benefits: ["Traditional preparation", "Rich in vitamins", "Probiotic properties"],
        nutritionalInfo: "Fermented moringa leaves with beneficial enzymes"
    }
};

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Initialize the application
let cart;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart
    cart = new ShoppingCart();
    
    // Show home section by default
    document.getElementById('home').classList.remove('hidden');
    
    // Initialize any other components
    initializeAnimations();
    setupLazyLoading();
});

function initializeAnimations() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.product-card, .bg-light-green > div').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function setupLazyLoading() {
    // Implement lazy loading for images
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// Service worker registration for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
}
