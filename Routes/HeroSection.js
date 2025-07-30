import express from 'express';
import {
  createHeroSection,
  getHeroSections,
  updateHeroSection,
  deleteHeroImage,
} from '../Controllers/HeroController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getHeroSections)
  .post(upload.array('images', 10), createHeroSection);

  router.route('/:id')
  .put(upload.array('images', 10), updateHeroSection);

router.delete('/:id/images/:index', deleteHeroImage);

export default router;
