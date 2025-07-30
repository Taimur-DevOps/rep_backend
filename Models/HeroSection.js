import mongoose from 'mongoose';

const heroSectionSchema = new mongoose.Schema(
  {
    images: [
      {
        type: String, // Store image URLs or paths
      },
    ],
  },
  {
    timestamps: true,
  }
);

const HeroSection = mongoose.model('heroSection', heroSectionSchema);

export default HeroSection;
