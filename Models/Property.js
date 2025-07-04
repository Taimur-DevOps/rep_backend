import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    houseNumber: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String, // Store image URLs or paths
      },
    ],
    propertyType: {
      type: String,
      required: true,
      enum: ['house', 'apartment', 'farmhouse', 'commercial'],
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    garage: {
      type: Number,
      required: true,
    },
    areaSize: {
      type: String,
      required: true,
    },
    yearBuilt: {
      type: Number,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Property = mongoose.model('Property', propertySchema);

export default Property;