import HeroSection from '../Models/HeroSection.js'; 

// @desc    Create a new hero section
// @route   POST /api/hero-section
// @access  Public or Protected (based on your app logic)
export const createHeroSection = async (req, res) => {
  try {
    const { title } = req.body;

    // ✅ Read image file paths
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    const heroSection = await HeroSection.create({ title, images });

    res.status(201).json(heroSection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all hero sections
// @route   GET /api/hero-section
// @access  Public or Protected
export const getHeroSections = async (req, res) => {
  try {
    const heroSections = await HeroSection.find().sort({ createdAt: -1 });
    res.status(200).json(heroSections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Update a hero section
// @route   PUT /api/hero-section/:id
// @access  Protected (typically admin)
export const updateHeroSection = async (req, res) => {
  try {
    const { title, images } = req.body;

    const heroSection = await HeroSection.findById(req.params.id);

    if (!heroSection) {
      return res.status(404).json({ message: 'Hero section not found' });
    }

    heroSection.title = title || heroSection.title;
    heroSection.images = images || heroSection.images;

    const updatedHeroSection = await heroSection.save();
    res.status(200).json(updatedHeroSection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete image from hero section
// @route   DELETE /api/hero-section/:id/images/:index
// @access  Protected
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

    heroSection.images.splice(idx, 1); // remove image at index
    await heroSection.save();

    res.status(200).json({ message: 'Image removed', images: heroSection.images });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

