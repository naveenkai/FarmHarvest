// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.updateCartCount();
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

        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
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

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
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
            });
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
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.classList.remove('active', 'bg-organic-green', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            // Reset "All Products" to active
            const allProductsBtn = document.querySelector('[data-category="all"]');
            if (allProductsBtn) {
                allProductsBtn.classList.remove('bg-gray-200', 'text-gray-700');
                allProductsBtn.classList.add('active', 'bg-organic-green', 'text-white');
            }
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
