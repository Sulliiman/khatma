const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const MONGO_URL = process.env.MONGO_URL;

const client = new MongoClient(MONGO_URL);
const PORT = process.env.PORT || 3000;

let collection;
let stats;

// اتصال بالداتا بيس
async function connectDB() {
  await client.connect();
  const db = client.db("quran");
  collection = db.collection("juz");

  // إنشاء 30 جزء أول مرة
  const count = await collection.countDocuments();
  if (count === 0) {
    const juz = [];
    for (let i = 1; i <= 30; i++) {
      juz.push({ juz: i, name: "", done: false });
    }
    await collection.insertMany(juz);
  }
  stats = db.collection("stats");

  const exists = await stats.findOne({ key: "khatmat" });
    if (!exists) {
    await stats.insertOne({ key: "khatmat", count: 0 });
    }

  console.log('Connected to MongoDB');
}

// جلب كل الأجزاء
app.get("/juz", async (req, res) => {
  const data = await collection.find().sort({ juz: 1 }).toArray();
  res.json(data);
});

app.get("/stats", async (req, res) => {
  const data = await stats.findOne({ key: "khatmat" });
  res.json(data);
});



//تسجيل الجزء باسم شخص
app.post("/juz/:number/register", async (req, res) => {
  const juzNumber = parseInt(req.params.number);
  const { name } = req.body;

  const juz = await collection.findOne({ juz: juzNumber });

  if (juz.name) {
    return res.status(400).json({ message: "الجزء مسجل مسبقًا" });
  }

  await collection.updateOne(
    { juz: juzNumber },
    { $set: { name } }
  );

  res.json({ message: "تم تسجيل الاسم" });
});

// تعليم جزء كمقروء
app.post("/juz/:number", async (req, res) => {
  const juzNumber = parseInt(req.params.number);

  const juz = await collection.findOne({ juz: juzNumber });

  if (!juz.name) {
    return res.status(400).json({ message: "سجل الاسم أولًا" });
  }

  if (juz.done) {
    return res.status(400).json({ message: "الجزء مكتمل" });
  }

  await collection.updateOne(
    { juz: juzNumber },
    { $set: { done: true } }
  );

  res.json({ message: "تم الإكمال" });
});

//تصفير الختمة
app.post("/reset", async (req, res) => {
  // تصفير الأجزاء
  await collection.updateMany(
    {},
    { $set: { name: "", done: false } }
  );

  // زيادة عدد الختمات
  await stats.updateOne(
    { key: "khatmat" },
    { $inc: { count: 1 } }
  );

  res.json({ message: "تم بدء ختمة جديدة" });
});



connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
    .catch(err => {
        console.error('Failed to connect to DB');
        console.error(err);
    });

