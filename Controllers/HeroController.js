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
export const deleteHeroImage = async (req, res) => {
  try {
    const { id, index } = req.params;
    const heroSection = await HeroSection.findById(id);

    if (!heroSection) {
      return res.status(404).json({ message: 'Hero section not found' });
    }

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= heroSection.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    heroSection.images.splice(idx, 1);
    await heroSection.save();

    res.status(200).json({ message: 'Image removed', images: heroSection.images });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
