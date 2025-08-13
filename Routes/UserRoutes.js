import express from "express";
import multer from "multer";
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

// Multer memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// Routes
router.get("/search", searchUsers);
router.get("/paginated", getUsersPaginated);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", upload.array("images", 5), createUser);
router.put("/:id", upload.array("images", 5), updateUser);
router.delete("/:id", deleteUser);
router.delete("/:id/images/:imageIndex", deleteUserImage);

export default router;
