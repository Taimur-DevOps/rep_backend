import express from 'express';
import {
  createHeroSection,
  getHeroSections,
  updateHeroSection,
  deleteAllHeroSections,
  deleteImageFromHeroSection
} from '../Controllers/HeroController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getHeroSections)
  .post(upload.array('images', 10), createHeroSection)
  .delete(deleteAllHeroSections);

router.route('/:id')
  .put(upload.array('images', 10), updateHeroSection)

// Delete a specific image from a section
router.patch('/remove-image', deleteImageFromHeroSection);

export default router;
