class AdminPanel {
    constructor() {
        this.currentSection = 'products';
        this.products = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeProductModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeProductModal();
        });

        // Form submission
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Close modal on outside click
        document.getElementById('product-modal').addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                this.closeProductModal();
            }
        });
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/admin/check', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                window.location.href = '/';
                return;
            }
            
            const data = await response.json();
            document.getElementById('admin-name').textContent = data.email || 'Admin';
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        }
    }

    switchSection(section) {
        // Update active tab
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active', 'border-organic-green', 'text-organic-green');
            tab.classList.add('text-gray-600');
        });
        
        const activeTab = document.querySelector(`[data-section="${section}"]`);
        activeTab.classList.add('active', 'border-organic-green', 'text-organic-green');
        activeTab.classList.remove('text-gray-600');

        // Show/hide sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.add('hidden');
        });
        
        document.getElementById(`${section}-section`).classList.remove('hidden');
        this.currentSection = section;
        this.renderProducts();
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                this.products = await response.json();
                this.renderProducts();
            } else {
                console.error('Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts() {
        switch (this.currentSection) {
            case 'products':
                this.renderAllProducts();
                break;
            case 'featured':
                this.renderFeaturedProducts();
                break;
            case 'hero':
                this.renderHeroImages();
                break;
        }
    }

    renderAllProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    renderFeaturedProducts() {
        const grid = document.getElementById('featured-grid');
        grid.innerHTML = '';

        const featuredProducts = this.products.filter(p => p.featured);
        featuredProducts.forEach(product => {
            const productCard = this.createProductCard(product, true);
            grid.appendChild(productCard);
        });
    }

    renderHeroImages() {
        const grid = document.getElementById('hero-grid');
        grid.innerHTML = '';

        // Hero carousel management would go here
        const heroCard = document.createElement('div');
        heroCard.className = 'bg-white p-6 rounded-lg shadow-md';
        heroCard.innerHTML = `
            <h3 class="text-lg font-bold text-organic-brown mb-4">Hero Carousel Images</h3>
            <p class="text-gray-600 mb-4">Manage the 4 background images for the hero carousel section.</p>
            <button class="bg-organic-green text-white px-4 py-2 rounded hover:bg-opacity-90 transition">
                <i class="fas fa-images mr-2"></i>Manage Carousel
            </button>
        `;
        grid.appendChild(heroCard);
    }

    createProductCard(product, showFeaturedToggle = false) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-bold text-organic-brown">${product.name}</h3>
                    ${product.featured ? '<span class="bg-organic-green text-white px-2 py-1 rounded text-xs">Featured</span>' : ''}
                </div>
                <p class="text-gray-600 text-sm mb-2">${product.description}</p>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-organic-green font-bold">₹${product.price}/${product.unit}</span>
                    <span class="text-sm text-gray-500">Stock: ${product.stock}</span>
                </div>
                <div class="mb-3">
                    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">${product.category}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="admin.editProduct(${product.id})" class="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="admin.deleteProduct(${product.id})" class="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                    ${showFeaturedToggle ? '' : `
                        <button onclick="admin.toggleFeatured(${product.id})" class="bg-organic-green text-white px-3 py-2 rounded text-sm hover:bg-opacity-90 transition">
                            <i class="fas fa-star mr-1"></i>${product.featured ? 'Unfeature' : 'Feature'}
                        </button>
                    `}
                </div>
            </div>
        `;
        
        return card;
    }

    openProductModal(product = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('product-form');
        
        if (product) {
            title.textContent = 'Edit Product';
            this.populateForm(product);
        } else {
            title.textContent = 'Add New Product';
            form.reset();
            document.getElementById('product-id').value = '';
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    populateForm(product) {
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-unit').value = product.unit;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-featured').checked = product.featured;
    }

    async saveProduct() {
        const formData = new FormData(document.getElementById('product-form'));
        const productData = {
            id: document.getElementById('product-id').value,
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            stock: parseInt(document.getElementById('product-stock').value),
            description: document.getElementById('product-description').value,
            image: document.getElementById('product-image').value,
            featured: document.getElementById('product-featured').checked
        };

        try {
            const url = productData.id ? `/api/products/${productData.id}` : '/api/products';
            const method = productData.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                this.showNotification('Product saved successfully!', 'success');
                this.closeProductModal();
                this.loadProducts();
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Failed to save product', 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error saving product', 'error');
        }
    }

    async editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.openProductModal(product);
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                this.showNotification('Product deleted successfully!', 'success');
                this.loadProducts();
            } else {
                this.showNotification('Failed to delete product', 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Error deleting product', 'error');
        }
    }

    async toggleFeatured(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...product,
                    featured: !product.featured
                })
            });

            if (response.ok) {
                this.showNotification(`Product ${product.featured ? 'unfeatured' : 'featured'} successfully!`, 'success');
                this.loadProducts();
            } else {
                this.showNotification('Failed to update product', 'error');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            this.showNotification('Error updating product', 'error');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white shadow-lg`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize admin panel
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminPanel();
});