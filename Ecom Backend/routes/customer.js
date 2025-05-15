const express = require("express");
const router = express.Router();
const { handlePlaceOrder, handleGetUserOrders } = require("../controller/order");
const { handleCreateOrUpdateReview } = require("../controller/product");



router.post("/placeOrder",handlePlaceOrder);
router.get("/myorders",handleGetUserOrders);
router.post("/review/:id",handleCreateOrUpdateReview);



module.exports = router;
