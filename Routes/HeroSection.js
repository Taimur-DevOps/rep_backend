import express from 'express';
import {
  createHeroSection,
  getHeroSections,
  updateHeroSection,
  deleteHeroSection,
  deleteAllHeroSections
} from '../Controllers/HeroController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getHeroSections)
  .post(upload.array('images', 10), createHeroSection)
  .delete(deleteAllHeroSections); 

  router.route('/:id')
  .put(upload.array('images', 10), updateHeroSection);

router.route('/:id')
  .delete(deleteHeroSection); // Add this below your PUT

export default router;
