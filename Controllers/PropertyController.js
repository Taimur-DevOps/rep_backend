import Property from "../Models/Property.js";
import fs from "fs";
import path from "path";

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({});
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get paginated properties
// @route   GET /api/properties/paginated
// @access  Public
const getPaginatedProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalProperties = await Property.countDocuments({});
    const totalPages = Math.ceil(totalProperties / limit);

    // Get paginated properties
    const properties = await Property.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalProperties,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (property) {
      res.status(200).json(property);
    } else {
      res.status(404).json({ message: "Property not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private
const createProperty = async (req, res) => {
  try {
    const {
      propertyId,
      title,
      description,
      price,
      location,
      houseNumber,
      blockNumber,
      propertyType,
      bedrooms,
      bathrooms,
      garage,
      areaSize,
      yearBuilt,
      featured,
      features,
    } = req.body;

    // Handle file uploads
    const images = req.files ? req.files.map((file) => file.path) : [];

    const property = new Property({
      propertyId,
      title,
      description,
      price,
      location,
      houseNumber,
      blockNumber,
      images,
      propertyType,
      bedrooms,
      bathrooms,
      garage,
      areaSize,
      yearBuilt,
      featured: featured === "true",
      features: features ? JSON.parse(features) : [],
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Fields to update
    const {
      propertyId,
      title,
      description,
      price,
      location,
      houseNumber,
      blockNumber,
      propertyType,
      bedrooms,
      bathrooms,
      garage,
      areaSize,
      yearBuilt,
      featured,
      features,
    } = req.body;

    // Handle uploaded images
    let images = property.images;

    if (req.files && req.files.length > 0) {
      // Add new images to existing ones
      const newImages = req.files.map((file) => file.path);
      images = [...images, ...newImages];
    }

    // Update property fields
    property.propertyId = propertyId || property.propertyId;
    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price || property.price;
    property.location = location || property.location;
    property.houseNumber = houseNumber || property.houseNumber;
    property.blockNumber = blockNumber || property.blockNumber;
    property.images = images;
    property.propertyType = propertyType || property.propertyType;
    property.bedrooms = bedrooms || property.bedrooms;
    property.bathrooms = bathrooms || property.bathrooms;
    property.garage = garage || property.garage;
    property.areaSize = areaSize || property.areaSize;
    property.yearBuilt = yearBuilt || property.yearBuilt;
    property.featured = featured === "true" || property.featured;
    property.features = features ? JSON.parse(features) : property.features;

    const updatedProperty = await property.save();
    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Delete associated images from filesystem
    property.images.forEach((image) => {
      const imagePath = path.join(process.cwd(), image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await property.deleteOne();
    res.status(200).json({ message: "Property removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an image from a property
// @route   DELETE /api/properties/:id/images/:imageIndex
// @access  Private
const deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const imageIndex = parseInt(req.params.imageIndex);

    if (imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    // Delete the image file
    const imagePath = path.join(process.cwd(), property.images[imageIndex]);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove image from array
    property.images.splice(imageIndex, 1);

    const updatedProperty = await property.save();
    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
const searchProperties = async (req, res) => {
  try {
    const { location, propertyType, bedrooms, bathrooms, minPrice, maxPrice } =
      req.query;

    const query = {};

    if (location) query.location = { $regex: location, $options: "i" };
    if (propertyType) query.propertyType = propertyType;
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: parseInt(bathrooms) };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(query);
    res.status(200).json(properties);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search properties with pagination
// @route   GET /api/properties/search/paginated
// @access  Public
const searchPropertiesPaginated = async (req, res) => {
  try {
    const {
      location,
      propertyType,
      bedrooms,
      bathrooms,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (location) query.location = { $regex: location, $options: "i" };
    if (propertyType) query.propertyType = propertyType;
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: parseInt(bathrooms) };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalProperties = await Property.countDocuments(query);
    const totalPages = Math.ceil(totalProperties / limitNum);

    // Get paginated search results
    const properties = await Property.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      properties,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProperties,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getProperties,
  getPaginatedProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  searchProperties,
  searchPropertiesPaginated,
};
