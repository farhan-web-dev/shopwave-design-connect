// Add this to your existing backend

// 1. Install Stripe dependency
// npm install stripe

// 2. Create stripe config file: src/config/stripe.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
module.exports = stripe;

// 3. Add to your .env file:
// STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
// STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
// STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

// 4. Create payment controller: src/controllers/paymentController.js
const stripe = require("../config/stripe");
const Order = require("../models/Order"); // Adjust path to your Order model
const Product = require("../models/Product"); // Adjust path to your Product model

// Create Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, items, shippingAddress } = req.body;
    const userId = req.user.id; // Adjust based on your auth middleware

    // Validate required fields
    if (!amount || !currency || !items || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: amount, currency, items, shippingAddress",
      });
    }

    // Validate items and check stock
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.id} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.title}`,
        });
      }

      validatedItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      });

      subtotal += product.price * item.quantity;
    }

    // Calculate shipping (free over $100, otherwise $10)
    const shipping = subtotal > 100 ? 0 : items.length > 0 ? 10 : 0;
    const total = subtotal + shipping;

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: userId,
        items: JSON.stringify(validatedItems),
        shippingAddress: JSON.stringify(shippingAddress),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create order in database with pending status
    const order = new Order({
      user: userId,
      items: validatedItems,
      shippingAddress,
      paymentIntentId: paymentIntent.id,
      paymentStatus: "pending",
      orderStatus: "pending",
      subtotal,
      shipping,
      total,
      currency: currency.toLowerCase(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

// Confirm Payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: "Payment intent not found",
      });
    }

    // Find the order
    const order = await Order.findOne({
      paymentIntentId: paymentIntentId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order based on payment status
    if (paymentIntent.status === "succeeded") {
      order.paymentStatus = "paid";
      order.orderStatus = "processing";

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      await order.save();

      res.status(200).json({
        success: true,
        paymentIntentId: paymentIntent.id,
        orderId: order._id,
        message: "Payment confirmed successfully",
      });
    } else {
      order.paymentStatus = "failed";
      await order.save();

      res.status(400).json({
        success: false,
        message: "Payment failed",
        error:
          paymentIntent.last_payment_error?.message ||
          "Payment was not successful",
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error.message,
    });
  }
};

// Get Payment Status
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user.id;

    // Find the order
    const order = await Order.findOne({
      paymentIntentId: paymentIntentId,
      user: userId,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Retrieve payment intent from Stripe for latest status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      paymentStatus: paymentIntent.status,
      orderStatus: order.orderStatus,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};

// Get Order Details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        total: order.total,
        items: order.items,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
      },
    });
  } catch (error) {
    console.error("Error getting order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order details",
      error: error.message,
    });
  }
};

// Get User Orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  getOrderDetails,
  getUserOrders,
};

// 5. Create payment routes: src/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  getOrderDetails,
  getUserOrders,
} = require("../controllers/paymentController");

// Add your authentication middleware here
const authenticateToken = require("../middleware/auth"); // Adjust path

// Payment routes
router.post("/create-intent", authenticateToken, createPaymentIntent);
router.post("/confirm", authenticateToken, confirmPayment);
router.get("/status/:paymentIntentId", authenticateToken, getPaymentStatus);

// Order routes
router.get("/orders/:orderId", authenticateToken, getOrderDetails);
router.get("/orders", authenticateToken, getUserOrders);

module.exports = router;

// 6. Add to your main app.js or server.js:
// const paymentRoutes = require('./routes/paymentRoutes');
// app.use('/api/v1/payments', paymentRoutes);
