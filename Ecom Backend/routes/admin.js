const express = require("express");
const router = express.Router();
const {handleCreateProduct, handleUpdateProduct} = require("../controller/product");
const { handleGetAllOrders, handleUpdateOrderStatus } = require("../controller/order");
const upload = require("../middleware/upload");



router.post("/createProduct",upload.array('images',5),handleCreateProduct);
router.put("/updateProduct/:id",upload.array('images',5),handleUpdateProduct);  
router.get("/orders/fetchAll",handleGetAllOrders);
router.put("/orders/update/:id",handleUpdateOrderStatus);



module.exports = router;
