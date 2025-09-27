const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { migrate } = require("./serviceworker/migration");
const routes = require("./config/routes");
const path = require("path");
require("dotenv").config();

const app = express();
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", process.env.FRONTEND_URL].filter(Boolean);
// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => {
    return req.path.startsWith("/api/master") || req.path === "/api/auth/logout";
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many authentication attempts, please try again later." },
  skip: (req) => req.path === "/api/auth/logout",
});

const masterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many master access attempts." },
  skip: (req) => req.path === "/api/auth/logout",
});
app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/master", masterLimiter);
// app.use("/api/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static("public"));

for (const { path, router } of routes.paths) {
  app.use(path, router);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  migrate()
    .then(() => {
      console.log("Migration completed");
    })
    .catch((err) => {
      console.error("Migration error:", err);
    });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });
});
