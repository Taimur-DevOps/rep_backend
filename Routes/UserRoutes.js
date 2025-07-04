import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  getUsers,
  getUsersPaginated,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUserImage,
  searchUsers,
} from "../Controllers/UserController.js";

const router = express.Router();

// ES Modules path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/users"));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "user-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
});

// Routes

// Search users (must be before /:id routes)
router.get("/search", searchUsers);

// Get paginated users
router.get("/paginated", getUsersPaginated);

// Get all users
router.get("/", getUsers);

// Get single user
router.get("/:id", getUserById);

// Create user with image upload
router.post("/", upload.array("images", 5), createUser);

// Update user with image upload
router.put("/:id", upload.array("images", 5), updateUser);

// Delete user
router.delete("/:id", deleteUser);

// Delete specific user image
router.delete("/:id/images/:imageIndex", deleteUserImage);

export default router;
