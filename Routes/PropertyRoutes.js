import express from "express";
import multer from "multer";
import path from "path";
import {
  getProperties,
  getPaginatedProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  searchProperties,
  searchPropertiesPaginated,
} from "../Controllers/PropertyController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// IMPORTANT: Order matters! More specific routes first
// Pagination routes (must come before /:id)
router.route("/paginated").get(getPaginatedProperties);
router.route("/search/paginated").get(searchPropertiesPaginated);

// Featured properties route
router.route("/featured").get(getFeaturedProperties);

// Search routes
router.route("/search").get(searchProperties);

// Basic property routes
router
  .route("/")
  .get(getProperties)
  .post(upload.array("images", 10), createProperty); // Allow up to 10 images

// Individual property routes (must come after specific routes)
router
  .route("/:id")
  .get(getPropertyById)
  .put(upload.array("images", 10), updateProperty)
  .delete(deleteProperty);

// Property image management route
router.route("/:id/images/:imageIndex").delete(deletePropertyImage);

export default router;
