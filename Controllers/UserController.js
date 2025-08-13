import User from "../Models/UserModel.js";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// @desc Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get users paginated
export const getUsersPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ isActive: true });
    const users = await User.find({ isActive: true })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create user
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, department, bio, skills } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User with this email already exists" });

    // Handle skills parsing
    let parsedSkills = [];
    if (skills) {
      if (typeof skills === "string") {
        try {
          parsedSkills = JSON.parse(skills);
        } catch {
          parsedSkills = [skills];
        }
      } else if (Array.isArray(skills)) {
        parsedSkills = skills;
      }
    }

    // Upload images to Cloudinary
    let uploadedImages = [];
    if (req.files?.length) {
      uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer, "users");
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
    }

    const user = await User.create({
      name,
      email,
      phone,
      role,
      department,
      bio,
      skills: parsedSkills,
      images: uploadedImages,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, department, bio, skills } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check duplicate email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User with this email already exists" });
    }

    // Parse skills
    let parsedSkills = user.skills;
    if (skills !== undefined) {
      if (typeof skills === "string") {
        try {
          parsedSkills = JSON.parse(skills);
        } catch {
          parsedSkills = [skills];
        }
      } else if (Array.isArray(skills)) {
        parsedSkills = skills;
      }
    }

    // Upload new images to Cloudinary
    let newImages = [];
    if (req.files?.length) {
      newImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer, "users");
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
    }

    // Update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || user.name,
        email: email || user.email,
        phone: phone || user.phone,
        role: role || user.role,
        department: department || user.department,
        bio: bio || user.bio,
        skills: parsedSkills,
        images: newImages.length > 0 ? [...user.images, ...newImages] : user.images,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Delete images only if they have a Cloudinary public_id
    if (user.images?.length) {
      await Promise.all(
        user.images
          .filter(img => img?.public_id) // skip old local images
          .map(img => cloudinary.uploader.destroy(img.public_id))
      );
    }

    // Remove user from DB
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc Delete specific user image
export const deleteUserImage = async (req, res) => {
  try {
    const { id, index } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const image = user.images[index];
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // ✅ Only try Cloudinary deletion if public_id exists
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Remove from array and save
    user.images.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Image deleted successfully", images: user.images });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Search users
export const searchUsers = async (req, res) => {
  try {
    const { q, role, department, page = 1, limit = 10 } = req.query;

    let searchQuery = { isActive: true };
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { skills: { $in: [new RegExp(q, "i")] } },
      ];
    }
    if (role && role !== "all") searchQuery.role = role;
    if (department && department !== "all") searchQuery.department = department;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(searchQuery);
    const users = await User.find(searchQuery)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      users,
      searchInfo: { query: q || "", role: role || "all", department: department || "all", totalResults: total },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
