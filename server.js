const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                unit VARCHAR(50) NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                description TEXT,
                image TEXT,
                featured BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if products table is empty and insert default products
        const result = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(result.rows[0].count) === 0) {
            await insertDefaultProducts();
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

async function insertDefaultProducts() {
    const defaultProducts = [
        {
            name: 'Organic Tomatoes',
            category: 'vegetables',
            price: 120,
            unit: 'kg',
            stock: 50,
            description: 'Fresh, juicy tomatoes with 27% higher vitamin C than conventional varieties',
            image: 'https://pixabay.com/get/g0581cd6d89c6c7a12e15644b3ce8f532a2d47d74c716eb1419a409064c052cba0a3d83a16d8367096b1dad5244e9459e571324b8939249aa26a9756a4fe5036c_1280.jpg',
            featured: true
        },
        {
            name: 'Organic Potatoes',
            category: 'vegetables',
            price: 80,
            unit: 'kg',
            stock: 30,
            description: '4x more vitamin B5 than tomatoes, high in potassium and fiber',
            image: 'https://pixabay.com/get/g0581cd6d89c6c7a12e15644b3ce8f532a2d47d74c716eb1419a409064c052cba0a3d83a16d8367096b1dad5244e9459e571324b8939249aa26a9756a4fe5036c_1280.jpg',
            featured: false
        },
        {
            name: 'Fresh Watermelon',
            category: 'fruits',
            price: 40,
            unit: 'kg',
            stock: 25,
            description: '92% water content, rich in lycopene and natural antioxidants',
            image: 'https://pixabay.com/get/gcafab46e499d79507e9eec1e005058491b55741fb6e18b13a53da3b20bd59a938a5bd5bd63d11e391c91dd88c3115d83766dc5f0bf68fef5459afee743127fc6_1280.jpg',
            featured: true
        },
        {
            name: 'Moringa Powder',
            category: 'moringa',
            price: 450,
            unit: '100g',
            stock: 20,
            description: 'Superfood powder with 90+ nutrients, all 9 essential amino acids',
            image: 'https://pixabay.com/get/g195c00efc787726497e5951c329d525d38709b3524d13b6aa307c3fdd46b86ad1619e6db64d57ef73e5a60c48554a81affb07eb071d73cffbd575713d5a6889f_1280.jpg',
            featured: true
        },
        {
            name: 'Moringa Tea Powder',
            category: 'moringa',
            price: 350,
            unit: '100g',
            stock: 15,
            description: 'Antioxidant-rich tea powder for blood sugar control and heart health',
            image: 'https://pixabay.com/get/g195c00efc787726497e5951c329d525d38709b3524d13b6aa307c3fdd46b86ad1619e6db64d57ef73e5a60c48554a81affb07eb071d73cffbd575713d5a6889f_1280.jpg',
            featured: false
        }
    ];

    for (const product of defaultProducts) {
        await pool.query(`
            INSERT INTO products (name, category, price, unit, stock, description, image, featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [product.name, product.category, product.price, product.unit, product.stock, product.description, product.image, product.featured]);
    }
    
    console.log('Default products inserted');
}

// In-memory storage for OTPs (in production, use Redis or a database)
const otpStorage = new Map();
const userSessions = new Map();

// Admin credentials
const adminCredentials = {
    id: "8144680437",
    password: "Thefarmer@143"
};

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
async function sendOTPEmail(email, otp, name) {
    const msg = {
        to: email,
        from: 'noreply@organicfarming.com', // Replace with your verified sender
        subject: 'Your OTP for The Sustainable Organic Farming',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #5a8f45; margin-bottom: 10px;">The Sustainable Organic Farming</h1>
                    <p style="color: #666;">Premium Organic Products</p>
                </div>
                
                <div style="background-color: #f8f6f0; padding: 30px; border-radius: 10px; text-align: center;">
                    <h2 style="color: #8c6e4a; margin-bottom: 20px;">Hello ${name}!</h2>
                    <p style="color: #666; margin-bottom: 30px;">Your verification code for logging into your account:</p>
                    
                    <div style="background-color: #5a8f45; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">
                        This code will expire in 10 minutes. Do not share this code with anyone.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>This is an automated message from The Sustainable Organic Farming</p>
                </div>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
}

// Handle API requests
// Parse request body for POST/PUT requests
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// Check if user is authenticated as admin
function isAdminAuthenticated(req) {
    const cookies = parseCookies(req.headers.cookie || '');
    const sessionId = cookies.sessionId;
    return sessionId && userSessions.has(sessionId) && userSessions.get(sessionId).isAdmin;
}

// Parse cookies helper
function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
            cookies[name] = decodeURIComponent(value);
        }
    });
    return cookies;
}

async function handleAPIRequest(req, res, pathname) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        // Handle product API endpoints
        if (pathname.startsWith('/api/products')) {
            const pathParts = pathname.split('/');
            
            if (req.method === 'GET' && pathname === '/api/products') {
                // Get all products
                const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows));
                return;
            }
            
            if (req.method === 'POST' && pathname === '/api/products') {
                // Create new product (admin only)
                if (!isAdminAuthenticated(req)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
                    return;
                }
                
                const productData = await parseBody(req);
                const result = await pool.query(`
                    INSERT INTO products (name, category, price, unit, stock, description, image, featured)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `, [productData.name, productData.category, productData.price, productData.unit, 
                    productData.stock, productData.description, productData.image, productData.featured]);
                
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows[0]));
                return;
            }
            
            if (req.method === 'PUT' && pathParts[2] === 'products' && pathParts[3]) {
                // Update product (admin only)
                if (!isAdminAuthenticated(req)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
                    return;
                }
                
                const productId = pathParts[3];
                const productData = await parseBody(req);
                const result = await pool.query(`
                    UPDATE products 
                    SET name = $1, category = $2, price = $3, unit = $4, stock = $5, 
                        description = $6, image = $7, featured = $8, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $9
                    RETURNING *
                `, [productData.name, productData.category, productData.price, productData.unit,
                    productData.stock, productData.description, productData.image, productData.featured, productId]);
                
                if (result.rows.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows[0]));
                return;
            }
            
            if (req.method === 'DELETE' && pathParts[2] === 'products' && pathParts[3]) {
                // Delete product (admin only)
                if (!isAdminAuthenticated(req)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Unauthorized' }));
                    return;
                }
                
                const productId = pathParts[3];
                const result = await pool.query('DELETE FROM products WHERE id = $1', [productId]);
                
                if (result.rowCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product not found' }));
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                return;
            }
        }
        
        // Handle admin check endpoint
        if (pathname === '/api/admin/check' && req.method === 'GET') {
            const cookies = parseCookies(req.headers.cookie || '');
            const sessionId = cookies.sessionId;
            
            if (sessionId && userSessions.has(sessionId) && userSessions.get(sessionId).isAdmin) {
                const session = userSessions.get(sessionId);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    authenticated: true, 
                    email: session.id,
                    type: 'admin'
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not authenticated' }));
            }
            return;
        }
        
        // Handle admin logout
        if (pathname === '/api/admin/logout' && req.method === 'POST') {
            const cookies = parseCookies(req.headers.cookie || '');
            const sessionId = cookies.sessionId;
            
            if (sessionId && userSessions.has(sessionId)) {
                userSessions.delete(sessionId);
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }
        
        if (pathname === '/api/send-otp' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const { email, otp, name } = JSON.parse(body);
                    
                    // Validate input
                    if (!email || !otp || !name) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing required fields' }));
                        return;
                    }

                    // Store OTP with expiration (10 minutes)
                    otpStorage.set(email, {
                        otp: otp,
                        name: name,
                        timestamp: Date.now(),
                        attempts: 0
                    });

                    // Send OTP email
                    const result = await sendOTPEmail(email, otp, name);
                    
                    if (result.success) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'OTP sent successfully' }));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Failed to send OTP', details: result.error }));
                    }
                } catch (error) {
                    console.error('API Error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal server error' }));
                }
            });
        } 
        else if (pathname === '/api/verify-otp' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const { email, otp } = JSON.parse(body);
                    
                    const otpData = otpStorage.get(email);
                    if (!otpData) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'OTP expired or not found' }));
                        return;
                    }

                    // Check if OTP is expired (10 minutes)
                    if (Date.now() - otpData.timestamp > 10 * 60 * 1000) {
                        otpStorage.delete(email);
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'OTP expired' }));
                        return;
                    }

                    // Check attempts
                    if (otpData.attempts >= 3) {
                        otpStorage.delete(email);
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Too many failed attempts' }));
                        return;
                    }

                    if (otp === otpData.otp) {
                        // Generate session ID
                        const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                        userSessions.set(sessionId, {
                            email: email,
                            name: otpData.name,
                            type: 'user',
                            loginTime: Date.now()
                        });

                        otpStorage.delete(email);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            sessionId: sessionId,
                            user: { email, name: otpData.name, type: 'user' }
                        }));
                    } else {
                        otpData.attempts++;
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            error: 'Invalid OTP', 
                            attemptsRemaining: 3 - otpData.attempts 
                        }));
                    }
                } catch (error) {
                    console.error('Verify OTP Error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal server error' }));
                }
            });
        }
        else if (pathname === '/api/admin-login' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const { adminId, password } = JSON.parse(body);
                    
                    if (adminId === adminCredentials.id && password === adminCredentials.password) {
                        // Generate session ID
                        const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                        userSessions.set(sessionId, {
                            id: adminId,
                            type: 'admin',
                            isAdmin: true,
                            loginTime: Date.now()
                        });

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            sessionId: sessionId,
                            user: { id: adminId, type: 'admin' }
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid admin credentials' }));
                    }
                } catch (error) {
                    console.error('Admin Login Error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal server error' }));
                }
            });
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    } catch (error) {
        console.error('API Handler Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

// Serve static files
function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Create server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${req.method} ${pathname}`);

    // Handle API requests
    if (pathname.startsWith('/api/')) {
        await handleAPIRequest(req, res, pathname);
        return;
    }

    // Serve admin.html for admin routes
    if (pathname === '/admin' || pathname === '/admin.html') {
        serveStaticFile(res, './admin.html');
        return;
    }

    // Serve static files
    let filePath = '.' + pathname;
    if (pathname === '/') {
        filePath = './index.html';
    }

    serveStaticFile(res, filePath);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured');
    
    // Initialize database
    await initializeDatabase();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully.');
    server.close(() => {
        console.log('Process terminated.');
    });
});