const express = require("express");
const router = express.Router();
const {handleCreateProduct, handleUpdateProduct} = require("../controller/product");
const { handleGetAllOrders, handleUpdateOrderStatus } = require("../controller/order");
const upload = require("../middleware/upload");



router.post("/createProduct",upload.single('image'),handleCreateProduct);
router.put("/updateProduct/:id",upload.single('image'),handleUpdateProduct);  
router.get("/orders/fetchAll",handleGetAllOrders);
router.put("/orders/update/:id",handleUpdateOrderStatus);



module.exports = router;
