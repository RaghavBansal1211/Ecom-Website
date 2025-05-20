const Product = require('../model/product');
const Review = require("../model/review");

const fs = require('fs');
const path = require('path');


const handleGetAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleGetProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleCreateProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    // Validate required fields
    if (!name || !description || !price || !stock) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const imageFiles = req.files;

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    if (imageFiles.length > 5) {
      return res.status(400).json({ message: 'You can upload a maximum of 5 images' });
    }

    const imageUrls = imageFiles.map(file => `/uploads/${file.filename}`);

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      imageUrl: imageUrls, 
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const handleUpdateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, deletedImages } = req.body;
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    let updatedImageUrls = existingProduct.imageUrl;

    // Parse deletedImages if it's a JSON string
    const deleted = deletedImages ? JSON.parse(deletedImages) : [];

    // Delete specified images from disk and filter them out
    if (deleted.length > 0) {
      deleted.forEach((img) => {
        const imgPath = path.join(__dirname, '..', img);
        fs.unlink(imgPath, (err) => {
          if (err) console.error('Failed to delete image:', err.message);
        });
      });

      updatedImageUrls = updatedImageUrls.filter((url) => !deleted.includes(url));
    }

    // Append new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updatedImageUrls = [...updatedImageUrls, ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        stock,
        imageUrl: updatedImageUrls,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Product updated', product: updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { handleUpdateProduct };



const handleCreateOrUpdateReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has already reviewed this product
    let existingReview = await Review.findOne({ userId, productId });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      return res.status(200).json({ message: 'Review updated', review: existingReview });
    }

    // Create new review
    const newReview = await Review.create({
      userId,
      productId,
      rating,
      comment
    });

    res.status(201).json({ message: 'Review added', review: newReview });

  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleGetReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).populate({
        path: 'userId',
        select: 'name', 
      });;

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = { handleGetAllProducts, handleGetProduct,handleUpdateProduct, handleCreateProduct,handleCreateOrUpdateReview,handleGetReviewsByProduct};


