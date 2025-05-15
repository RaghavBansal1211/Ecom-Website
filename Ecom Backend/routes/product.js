const express = require("express");
const router = express.Router();

const {handleGetAllProducts, handleGetProduct, handleGetReviewsByProduct} = require("../controller/product");



router.get("/fetchAll",handleGetAllProducts);
router.get("/:id",handleGetProduct);
router.get("/review/:id",handleGetReviewsByProduct);

module.exports = router;
