import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import HeroSection from '../Models/HeroSection.js'; 

// Helper to upload buffer files to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// CREATE
export const createHeroSection = async (req, res) => {
  try {
    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "hero-section");
      uploadedImages.push(result.secure_url);
    }

    const newSection = await HeroSection.create({ images: uploadedImages });

    res.status(201).json(newSection);
  } catch (err) {
    console.error("Error uploading hero section:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET
export const getHeroSections = async (req, res) => {
  try {
    const sections = await HeroSection.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateHeroSection = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSection = await HeroSection.findById(id);
    if (!existingSection) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "hero-section");
      uploadedImages.push(result.secure_url);
    }

    existingSection.images = [
      ...existingSection.images,
      ...uploadedImages
    ];

    await existingSection.save();
    res.json(existingSection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE one image
export const deleteImageFromHeroSection = async (req, res) => {
  try {
    const { sectionId, imageUrl } = req.body;

    const section = await HeroSection.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Not found" });

    // Remove from Cloudinary
    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    // Remove from DB
    section.images = section.images.filter(img => img !== imageUrl);
    await section.save();

    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE all
export const deleteAllHeroSections = async (req, res) => {
  try {
    const sections = await HeroSection.find();
    for (const section of sections) {
      for (const img of section.images) {
        const publicId = img.split("/").slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await HeroSection.deleteMany();
    res.json({ message: "All hero sections deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
