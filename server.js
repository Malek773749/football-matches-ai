// server.js - الإصدار المصحح
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS شامل
app.use(cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Middleware للتصحيح
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 🔥 النقاط الرئيسية - بدون /api في المسار
app.get('/fixtures', async (req, res) => {
    try {
        console.log('🔑 API Key:', process.env.RAPIDAPI_KEY ? 'موجود' : 'مفقود');
        
        const date = req.query.date || new Date().toISOString().split('T')[0];
        console.log(`📅 طلب مباريات تاريخ: ${date}`);
        
        const response = await axios.get('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
            params: { date },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            },
            timeout: 10000
        });
        
        console.log(`✅ تم جلب ${response.data.response?.length || 0} مباراة`);
        
        res.json({
            success: true,
            count: response.data.response?.length || 0,
            ...response.data
        });
        
    } catch (error) {
        console.error('❌ خطأ:', error.message);
        
        // بيانات تجريبية احتياطية
        res.json({
            success: false,
            message: 'استخدام بيانات تجريبية',
            response: [
                {
                    fixture: {
                        id: 1033474,
                        date: new Date().toISOString(),
                        status: { short: 'LIVE', elapsed: 65 }
                    },
                    teams: {
                        home: { name: 'الهلال', id: 535 },
                        away: { name: 'النصر', id: 536 }
                    },
                    league: {
                        id: 307,
                        name: 'الدوري السعودي',
                        country: 'السعودية',
                        logo: 'https://media.api-sports.io/football/leagues/307.png'
                    },
                    goals: { home: 2, away: 1 },
                    score: { halftime: { home: 1, away: 0 } }
                },
                {
                    fixture: {
                        id: 1033475,
                        date: new Date(Date.now() + 10800000).toISOString(), // بعد 3 ساعات
                        status: { short: 'NS' }
                    },
                    teams: {
                        home: { name: 'ريال مدريد', id: 541 },
                        away: { name: 'برشلونة', id: 529 }
                    },
                    league: {
                        id: 140,
                        name: 'الدوري الإسباني',
                        country: 'إسبانيا',
                        logo: 'https://media.api-sports.io/football/leagues/140.png'
                    },
                    goals: { home: null, away: null }
                }
            ]
        });
    }
});

// نقطة اختبار بسيطة
app.get('/test', (req, res) => {
    res.json({
        status: 'متصل ✅',
        service: 'Football Proxy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        apiKey: process.env.RAPIDAPI_KEY ? 'مثبت' : 'غير مثبت'
    });
});

// صفحة الرئيسية
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Football Proxy API</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #00c853; }
                .endpoint { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0; }
                code { background: #333; color: #fff; padding: 2px 6px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>⚽ Football Proxy API</h1>
            <p>الخدمة تعمل بنجاح!</p>
            
            <div class="endpoint">
                <h3>🔧 نقاط الخدمة:</h3>
                <p><strong>GET</strong> <code>/test</code> - اختبار الاتصال</p>
                <p><strong>GET</strong> <code>/fixtures?date=YYYY-MM-DD</code> - جلب المباريات</p>
            </div>
            
            <div class="endpoint">
                <h3>📊 معلومات النظام:</h3>
                <p><strong>الوقت:</strong> ${new Date().toLocaleString('ar-SA')}</p>
                <p><strong>API Key:</strong> ${process.env.RAPIDAPI_KEY ? '✅ مثبت' : '❌ غير مثبت'}</p>
            </div>
            
            <p>👉 استخدم هذا الرابط في تطبيقك: <code>https://football-matches-ai-1.onrender.com/fixtures</code></p>
        </body>
        </html>
    `);
});

// التعامل مع 404
app.use((req, res) => {
    res.status(404).json({
        error: 'مسار غير موجود',
        availableEndpoints: ['/', '/test', '/fixtures']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Test URL: http://localhost:${PORT}/test`);
});
