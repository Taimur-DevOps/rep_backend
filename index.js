// Modified index.js to include user routes
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import propertyRoutes from "./Routes/PropertyRoutes.js";
import userRoutes from "./Routes/UserRoutes.js"; // Import user routes
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";


dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ES Modules path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const usersUploadsDir = path.join(__dirname, "uploads", "users");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(usersUploadsDir)) {
  fs.mkdirSync(usersUploadsDir, { recursive: true });
}

// Connect to MongoDB
const url =
  "mongodb+srv://afaqqaan69:Hiba10987@cluster0.zxomi4o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(url).then(() => {
  console.log("Connected to the database.");
});

// Make uploads folder static - ensure correct permissions and path setup
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: function (res, path, stat) {
      // Set CORS headers to allow image loading
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

// API Routes
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes); // Add user routes

// Home route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/properties", "/api/users"],
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      "GET /api/properties",
      "POST /api/properties",
      "GET /api/properties/:id",
      "PUT /api/properties/:id",
      "DELETE /api/properties/:id",
      "GET /api/users",
      "POST /api/users",
      "GET /api/users/:id",
      "PUT /api/users/:id",
      "DELETE /api/users/:id",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // Multer error handling
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "Too many files uploaded" });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- Properties: http://localhost:${PORT}/api/properties`);
  console.log(`- Users: http://localhost:${PORT}/api/users`);
  console.log(`- Health check: http://localhost:${PORT}/health`);
});
