const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const generateTokens = (user) => {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' } // Short-lived access token
    );
  
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } // Longer-lived refresh token
    );
  
    return { accessToken, refreshToken };
  };

// User Signup
const signup = async (req, res) => {
  try {
    console.log("oiuytrexcb");
    
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

console.log("kkookkkooo",  name, email, password, hashedPassword);

    const newUser = await User.create({ name, email, password: hashedPassword });

    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({ message: 'User registered successfully',  accessToken,
        refreshToken,});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User Signin
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

 
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

  
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(403).json({ message: 'Refresh Token required' });
  
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid Refresh Token' });
  
      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );
  
      res.status(200).json({ accessToken });
    });
  };

  const signOut = async (req, res) => {
    try {
      // Optionally: log out action to DB for auditing
      res.status(200).json({ success: true, message: "Signed out successfully" });
    } catch (error) {
      console.error("Signout error:", error);
      res.status(500).json({ success: false, message: "Signout failed" });
    }
  };

  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpire = Date.now() + 3600000; // 1 hour
  
      user.resetToken = resetToken;
      user.resetTokenExpire = resetTokenExpire;
      await user.save();
  
      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
      await sendResetEmail(email, resetLink);
  
      res.status(200).json({ success: true, message: "Password reset link sent to email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };


  const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpire: { [Op.gt]: Date.now() },
        },
      });
  
      if (!user) return res.status(400).json({ message: "Invalid or expired token" });
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpire = null;
      await user.save();
  
      res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };


module.exports = {signup, signin, refreshToken, signOut, resetPassword, forgotPassword}
