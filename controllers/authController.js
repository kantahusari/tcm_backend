const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const exe_query = require("../serviceworker/dbservice").exe_query;

const { body, validationResult } = require("express-validator");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "30m";

// Input validation rules
const loginValidation = [body("username").trim().isLength({ min: 3 }).escape(), body("password").isLength({ min: 6 })];

const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    // Safe SQL query with parameterization
    const users = await exe_query("SELECT * FROM admins WHERE uname = ? LIMIT 1", [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = users[0];
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.upwd);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        sessionId: uuidv4(),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Store session in database
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await exe_query("INSERT INTO sessions (uid, token, expiresat) VALUES (?, ?, ?)", [user.id, token, expiresAt.toISOString()]);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// NEW
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await exe_query("DELETE FROM sessions WHERE token = ?", [token]);
    }
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
// ---------------------------------
// NEW verifyToken to handle file uploads
const verifyToken = async (req, res, next) => {
  try {
    // For file uploads, we need to be careful about how we read the request
    // Check content type to determine how to handle the request
    const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");

    if (isMultipart) {
      // For multipart requests, we need to handle them differently
      // Skip any body parsing and proceed to next middleware
      // We'll verify the token from headers only
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify the token without touching the request body
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check session in database
      const sessions = await exe_query("SELECT * FROM sessions WHERE token = ? AND expiresat > NOW()", [token]);

      if (sessions.length === 0) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Get user data
      const users = await exe_query("SELECT id, uname, uemail FROM admins WHERE id = ?", [decoded.userId]);

      if (users.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach user information to request
      req.user = users[0];

      // Don't update session expiration here - let the upload handler do it
      // to avoid any issues with the multipart stream

      next(); // Proceed to file upload
    } else {
      // Regular JSON request handling (your existing code)
      let token = req.headers.authorization?.replace("Bearer ", "");

      if (!token && req.query.token) {
        token = req.query.token;
      }

      if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if session exists in database
      const sessions = await exe_query("SELECT * FROM sessions WHERE token = ? AND expiresat > NOW()", [token]);

      if (sessions.length === 0) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Get user data
      const users = await exe_query("SELECT id, uname, uemail FROM admins WHERE id = ?", [decoded.userId]);

      if (users.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach user information to request
      req.user = users[0];

      // Update session expiration for non-file requests
      const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await exe_query("UPDATE sessions SET expiresat = ? WHERE token = ?", [newExpiresAt.toISOString(), token]);

      next();
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
  verifyToken,
  logout,
  loginValidation,
};
