const Order = require('../model/order');
const Product = require('../model/product');

const handlePlaceOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    let totalAmount = 0;

    // Check stock and update atomically
    for (let item of items) {
      const product = await Product.findOneAndUpdate(
        { name: item.name, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (!product) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }

      item.price = product.price; // lock price at time of order
      totalAmount += item.price * item.quantity;
    }

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleGetUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const handleGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const handleUpdateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus:status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {handlePlaceOrder,handleGetUserOrders,handleGetAllOrders,handleUpdateOrderStatus};