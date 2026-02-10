require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const EMAIL = process.env.OFFICIAL_EMAIL;

/* ================= HEALTH ================= */

app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

/* ================= HELPERS ================= */

function fibonacci(n) {
  const res = [];
  let a = 0,
    b = 1;

  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

/* ================= POST /bfhl ================= */

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key required",
      });
    }

    const key = keys[0];
    console.log("RECEIVED KEY 👉", JSON.stringify(key));

    const value = body[key];

    let result;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0 || value > 1000) {
          return res.status(400).json({
            is_success: false,
            error: "fibonacci must be integer between 0-1000",
          });
        }
        result = fibonacci(value);
        break;

      case "prime":
        if (!Array.isArray(value) || !value.every(Number.isInteger)) {
          return res.status(400).json({
            is_success: false,
            error: "prime must be integer array",
          });
        }
        result = value.filter(isPrime);
        break;

      case "hcf":
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          !value.every(Number.isInteger)
        ) {
          return res.status(400).json({
            is_success: false,
            error: "hcf must be non-empty integer array",
          });
        }
        result = hcf(value);
        break;

      case "lcm":
        if (
          !Array.isArray(value) ||
          value.length === 0 ||
          !value.every(Number.isInteger)
        ) {
          return res.status(400).json({
            is_success: false,
            error: "lcm must be non-empty integer array",
          });
        }
        result = lcm(value);
        break;

   case "AI":
  if (typeof value !== "string" || value.trim() === "") {
    return res.status(400).json({
      is_success: false,
      error: "AI must be a string",
    });
  }

  const aiResponse = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: value }],
        },
      ],
    }
  );

  const text =
    aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  result = text.trim().split(/\s+/)[0] || "Unknown";

  break;


      default:
        return res.status(400).json({
          is_success: false,
          error: "Invalid key",
        });
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result,
    });
  } catch (err) {
    console.error("FULL ERROR 👉", err.response?.data || err.message);

    return res.status(500).json({
      is_success: false,
      error: "Internal Server Error",
    });
  }
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
