import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: [
        "Admin",
        "Manager",
        "Agent",
        "Assistant",
        "Developer",
        "Marketing",
        "Sales",
      ],
      default: "Agent",
    },
    department: {
      type: String,
      enum: [
        "Sales",
        "Marketing",
        "Operations",
        "IT",
        "HR",
        "Finance",
        "Management",
      ],
      default: "Sales",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String, // Store file paths
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    // Optional password field for authentication (if needed later)
    password: {
      type: String,
      select: false, // Don't include in queries by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });

// Virtual for user's full profile URL (if needed)
userSchema.virtual("profileUrl").get(function () {
  return `/api/users/${this._id}`;
});

// Method to get user's primary image
userSchema.methods.getPrimaryImage = function () {
  return this.images && this.images.length > 0 ? this.images[0] : null;
};

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role: role, isActive: true });
};

// Static method to find users by department
userSchema.statics.findByDepartment = function (department) {
  return this.find({ department: department, isActive: true });
};

const User = mongoose.model("User", userSchema);

export default User;
