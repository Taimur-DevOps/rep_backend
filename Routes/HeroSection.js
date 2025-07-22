import express from 'express';
import {
  createHeroSection,
  getHeroSections,
  getHeroSectionById,
  updateHeroSection,
  deleteHeroSection,
} from '../Controllers/HeroController.js';

const router = express.Router();

router.route('/')
  .get(getHeroSections)
  .post(createHeroSection);

router.route('/:id')
  .get(getHeroSectionById)
  .put(updateHeroSection)
  .delete(deleteHeroSection);

export default router;
