import mongoose from 'mongoose';

const heroSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String, // Store image URLs or paths
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const HeroSection = mongoose.model('heroSection', heroSectionSchema);

export default HeroSection;