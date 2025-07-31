import HeroSection from '../Models/HeroSection.js'; 

// Create a new hero section with uploaded images
export const createHeroSection = async (req, res) => {
  try {
    const images = req.files.map((file) => `/uploads/${file.filename}`);
    const heroSection = await HeroSection.create({ images });

    res.status(201).json(heroSection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all hero sections
export const getHeroSections = async (req, res) => {
  try {
    const heroSections = await HeroSection.find().sort({ createdAt: -1 });
    res.status(200).json(heroSections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update images of a hero section
export const updateHeroSection = async (req, res) => {
  try {
    const heroSection = await HeroSection.findById(req.params.id);
    if (!heroSection) return res.status(404).json({ message: "Not found" });

    const newImages = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    // ✅ Parse preserved image paths
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    heroSection.images = [...existingImages, ...newImages];

    const updated = await heroSection.save();
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// Delete a specific image from hero section
export const deleteImageFromHeroSection = async (req, res) => {
  const { sectionId, imagePath } = req.body;
  const heroSection = await HeroSection.findById(sectionId);
  if (!heroSection) return res.status(404).json({ message: "Section not found" });

  heroSection.images = heroSection.images.filter(img => img !== imagePath);
  await heroSection.save();

  res.status(200).json({ message: "Image removed", updatedImages: heroSection.images });
};

// Delete all hero sections
export const deleteAllHeroSections = async (req, res) => {
  try {
    await HeroSection.deleteMany({});
    res.status(200).json({ message: "All hero sections deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete all hero sections", error: error.message });
  }
};

