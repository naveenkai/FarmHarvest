const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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

    // Serve static files
    let filePath = '.' + pathname;
    if (pathname === '/') {
        filePath = './index.html';
    }

    serveStaticFile(res, filePath);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully.');
    server.close(() => {
        console.log('Process terminated.');
    });
});