import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// 🔑 قراءة مفتاح API من Render
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.error("❌ API_FOOTBALL_KEY غير موجود");
}

// ✅ endpoint جلب المباريات
app.get("/api/matches", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "API Error",
        details: data,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ خطأ:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
