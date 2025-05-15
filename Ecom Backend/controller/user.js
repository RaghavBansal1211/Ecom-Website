const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user'); 
const {setUser} = require("../auth");

const handleUserSignUp = async (req, res) => {
  try {
    const { name, email, password} = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // 3. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role:"CUSTOMER"    
    });

    await user.save();

    // 5. Generate JWT
    token = setUser(user);

    // 6. Respond
    res.status(201).json({
      message: 'User registered successfully',
      success:true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const handleUserLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Generate JWT
    const token = setUser(user);

    // 5. Respond with token and user info
    res.status(200).json({
      message: 'Login successful',
      success:true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { handleUserSignUp,handleUserLogIn };
