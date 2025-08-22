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
  searchPropertiesPaginated,  
} from "../Controllers/PropertyController.js";

const router = express.Router();

// Store in cloud memory instead of disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  },
});

// IMPORTANT: Order matters! More specific routes first
router.route("/paginated").get(getPaginatedProperties);
router.route("/search/paginated").get(searchPropertiesPaginated);

// Featured properties route
router.route("/featured").get(getFeaturedProperties);

// Basic property routes
router
  .route("/")
  .get(getProperties)
  .post(upload.array("images", 10), createProperty); // Allow up to 10 images

// Individual property routes
router
  .route("/:id")
  .get(getPropertyById)
  .put(upload.array("images", 10), updateProperty)
  .delete(deleteProperty);

// Property image management route
router.route("/:id/images/:imageIndex").delete(deletePropertyImage);

export default router;