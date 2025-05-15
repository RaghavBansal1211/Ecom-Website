const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
   
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },

    items: [
        {
            name:{
                type:String,
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    totalAmount:{
        type:Number,
        required:true,
    },
    shippingAddress: {
        type:String,
        required:true,
    },
    orderStatus:{ 
        type: String, 
        enum: ['Pending', 'Shipped', 'Delivered'], 
        default: 'Pending' 
    },

},{timestamps:true});

const Order = mongoose.model('orders',orderSchema);
module.exports = Order;

