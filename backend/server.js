// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Donation = require("./models/Donation");
const path = require("path");
const session = require("express-session");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- CONSTANTS ----------------
const MONGO_URI =
  "mongodb+srv://faransamra45:wXZHa3L3aZ1lBn0f@cluster0.0fudkxs.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
const ADMIN_USER = "JamesJones4301";
const ADMIN_PASS = "4301James#";

// ---------------- SESSIONS ----------------
app.use(session({
  secret: "SuperSecretKey123", // change this in production
  resave: false,
  saveUninitialized: true
}));

// ---------------- MONGODB CONNECTION ----------------
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ---------------- API ROUTES ----------------
app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/donations", async (req, res) => {
  try {
    const { number, name, email, phone, address, amount, paymentMethod, message } = req.body;
    const numbers = Array.isArray(number) ? number : [number];

    for (const num of numbers) {
      const existingDonation = await Donation.findOne({ number: { $in: [num] } });
      if (existingDonation) {
        return res.status(400).json({ success: false, error: `Number ${num} is already taken.` });
      }
    }

    const donation = new Donation({
      number: numbers,
      name,
      email,
      phone,
      address,
      amount,
      paymentMethod,
      message: message || ''
    });

    await donation.save();
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/donations/reset", async (req, res) => {
  try {
    await Donation.deleteMany({});
    res.json({ success: true, message: "All donations have been reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- LOGIN / ADMIN ----------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.authenticated = true;
    return res.redirect("/admin");
  }

  res.send("Invalid credentials. <a href='/login.html'>Try again</a>");
});

app.get("/admin", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "../frontend/admin.html"));
  } else {
    res.redirect("/login.html");
  }
});

app.get("/donate", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/donate.html"));
});

// ---------------- FRONTEND (Static HTML) ----------------
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT;
if (!PORT) {
  console.error("❌ PORT not set. Railway sets this automatically.");
  process.exit(1);
}

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));







