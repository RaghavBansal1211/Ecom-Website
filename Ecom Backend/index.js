const express = require('express');
const cookieParser = require("cookie-parser");
var cors = require('cors')

const app = express();


const {connectDB} = require("./config");
const PORT=8000;

app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
  }));



const { restrictToLoggedInUserOnly,restrictTo } = require('./middleware/auth');
const loginHandler = require("./routes/user");
const productHandler = require("./routes/product");
const adminHandler = require("./routes/admin");
const customerHandler = require("./routes/customer");


// Database Connection
connectDB("mongodb://127.0.0.1:27017/Ecom");

app.listen(PORT,()=>{
    console.log(`Server is listening at PORT: ${PORT}`);
})

app.use('/users',loginHandler);
app.use('/products',productHandler);
app.use('/admin',restrictToLoggedInUserOnly,restrictTo(["ADMIN"]),adminHandler);
app.use('/customer',restrictToLoggedInUserOnly,restrictTo(["CUSTOMER"]),customerHandler);
