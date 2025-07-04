import User from "../Models/UserModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users with pagination
// @route   GET /api/users/paginated?page=1&limit=10
// @access  Public
const getUsersPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await User.countDocuments({ isActive: true });

    // Get paginated users
    const users = await User.find({ isActive: true })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Most recent first

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, department, bio, skills } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/users/${file.filename}`);
    }

    // Parse skills if it's a string
    let parsedSkills = [];
    if (skills) {
      if (typeof skills === "string") {
        try {
          parsedSkills = JSON.parse(skills);
        } catch (e) {
          parsedSkills = [skills];
        }
      } else if (Array.isArray(skills)) {
        parsedSkills = skills;
      }
    }

    const user = await User.create({
      name,
      email,
      phone,
      role,
      department,
      bio,
      skills: parsedSkills,
      images,
    });

    res.status(201).json(user);
  } catch (error) {
    // If validation error, return specific message
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ message: validationErrors.join(", ") });
    }

    // If duplicate key error (email)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, department, bio, skills } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
    }

    // Handle uploaded images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => `/uploads/users/${file.filename}`);
    }

    // Parse skills if it's a string
    let parsedSkills = user.skills;
    if (skills !== undefined) {
      if (typeof skills === "string") {
        try {
          parsedSkills = JSON.parse(skills);
        } catch (e) {
          parsedSkills = [skills];
        }
      } else if (Array.isArray(skills)) {
        parsedSkills = skills;
      }
    }

    // Update user fields
    const updateData = {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      role: role || user.role,
      department: department || user.department,
      bio: bio || user.bio,
      skills: parsedSkills,
      images:
        newImages.length > 0 ? [...user.images, ...newImages] : user.images,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ message: validationErrors.join(", ") });
    }

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated images from filesystem
    if (user.images && user.images.length > 0) {
      user.images.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete specific user image
// @route   DELETE /api/users/:id/images/:imageIndex
// @access  Public
const deleteUserImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= user.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    // Delete image from filesystem
    const imagePath = user.images[index];
    const fullPath = path.join(__dirname, "..", imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove image from database
    user.images.splice(index, 1);
    await user.save();

    res.status(200).json({
      message: "Image deleted successfully",
      images: user.images,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name, email, role, or department
// @route   GET /api/users/search?q=searchterm&role=role&department=dept
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { q, role, department, page = 1, limit = 10 } = req.query;

    // Build search query
    let searchQuery = { isActive: true };

    // Text search across multiple fields
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { skills: { $in: [new RegExp(q, "i")] } },
      ];
    }

    // Filter by role
    if (role && role !== "all") {
      searchQuery.role = role;
    }

    // Filter by department
    if (department && department !== "all") {
      searchQuery.department = department;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for the search
    const total = await User.countDocuments(searchQuery);

    // Execute search with pagination
    const users = await User.find(searchQuery)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      users,
      searchInfo: {
        query: q || "",
        role: role || "all",
        department: department || "all",
        totalResults: total,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getUsers,
  getUsersPaginated,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUserImage,
  searchUsers,
};
