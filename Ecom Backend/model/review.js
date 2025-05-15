const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true,
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required:true,
    },
    rating:{
        type:Number,
        required:true,
    },
    comment:{
        type:String,
    }

},{timestamps:true});

const Review = mongoose.model('reviews',reviewSchema);
module.exports = Review;

