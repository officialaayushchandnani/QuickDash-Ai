import path from "path";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { createServer as createServer$1 } from "http";
import { Server } from "socket.io";
const MONGODB_URI = "mongodb+srv://chandnaniaayush6:Aayush%40123@cluster0.ym847od.mongodb.net/quickdash-ai?retryWrites=true&w=majority";
const connectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(MONGODB_URI);
      console.log("✅ MongoDB connected successfully");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.log("Server will continue without database connection");
  }
};
const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  deliveryTime: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  company: { type: String },
  size: { type: String },
  tags: { type: [String], index: true }
}, { timestamps: true });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.status(200).json(products);
});
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  if (!productData.name || !productData.price || !productData.category) {
    res.status(400);
    throw new Error("Please provide name, price, and category for the product.");
  }
  const product = new Product({
    ...productData,
    rating: 4.5,
    // Set default server-side
    reviews: 0
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const productRouter = Router();
productRouter.route("/").get(getProducts).post(createProduct);
productRouter.route("/:id").get(getProductById);
const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
}, { _id: false });
const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"], default: "pending" },
  paymentMethod: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryPartner: { type: Schema.Types.ObjectId, ref: "User" },
  assignedAt: { type: Date }
}, {
  timestamps: true
});
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const getMyOrders = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(200).json([]);
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  res.status(200).json(orders);
});
const createOrder = asyncHandler(async (req, res) => {
  const {
    userId,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    deliveryAddress,
    paymentMethod,
    customerName
  } = req.body;
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid User ID provided for order");
  }
  const order = new Order({
    orderNumber: `QD${Date.now()}`,
    userId,
    customerName,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    deliveryAddress,
    paymentMethod
  });
  const createdOrder = await order.save();
  try {
    const { io: io2 } = await Promise.resolve().then(() => index);
    if (io2) {
      io2.emit("new-order", createdOrder);
    }
  } catch (error) {
    console.error("Socket emit failed:", error);
  }
  res.status(201).json(createdOrder);
});
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("userId", "name email").populate("deliveryPartner", "name email phone").sort({ createdAt: -1 });
  res.status(200).json(orders);
});
const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deliveryPartnerId } = req.body;
  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.deliveryPartner = deliveryPartnerId;
  order.status = "preparing";
  order.assignedAt = /* @__PURE__ */ new Date();
  const updatedOrder = await order.save();
  try {
    const { io: io2 } = await Promise.resolve().then(() => index);
    if (io2) {
      io2.emit("order-updated", updatedOrder);
    }
  } catch (error) {
    console.error("Socket emit failed:", error);
  }
  res.status(200).json(updatedOrder);
});
const orderRouter = Router();
orderRouter.get("/", getMyOrders);
orderRouter.post("/", createOrder);
orderRouter.get("/all", getAllOrders);
orderRouter.put("/:id/assign", assignDeliveryPartner);
const demoCustomers = [
  { id: "1", name: "John Smith", email: "john@email.com", phone: "+91 98765 43210", orders: 24, totalSpent: 3250, joinDate: "2025-01-15", status: "Active", address: "123 Main Street, Satellite, Ahmedabad, Gujarat 380015", lastOrder: "2025-08-25", favoriteCategory: "Dairy", recentOrders: [{ id: "ORD001", date: "2025-08-25", amount: 145, status: "Delivered" }] },
  { id: "2", name: "Priya Patel", email: "priya@email.com", phone: "+91 98765 43211", orders: 18, totalSpent: 2890, joinDate: "2025-02-20", status: "Active", address: "456 Park Avenue, Vastrapur, Ahmedabad, Gujarat 380058", lastOrder: "2025-08-22", favoriteCategory: "Fruits", recentOrders: [{ id: "ORD004", date: "2025-08-22", amount: 160, status: "Delivered" }] },
  { id: "5", name: "Amit Shah", email: "amit@email.com", phone: "+91 98765 43214", orders: 45, totalSpent: 8940, joinDate: "2024-09-22", status: "VIP", address: "654 Prahlad Nagar, Ahmedabad, Gujarat 380015", lastOrder: "2025-08-28", favoriteCategory: "Beverages", recentOrders: [{ id: "ORD011", date: "2025-08-28", amount: 380, status: "Delivered" }] }
];
const demoDeliveryAgents = [
  { id: "1", name: "Jane Agent", email: "jane@agent.com", phone: "+91 98765 43211", vehicleNumber: "GJ-01-AB-1234", address: "Agent Colony, Vastrapur, Ahmedabad", joinDate: "2025-01-10", status: "Active", totalDeliveries: 156, rating: 4.8, earnings: 15600 },
  { id: "2", name: "Rahul Kumar", email: "rahul@agent.com", phone: "+91 98765 43212", vehicleNumber: "GJ-01-CD-5678", address: "Delivery Hub, Satellite, Ahmedabad", joinDate: "2025-02-15", status: "Active", totalDeliveries: 98, rating: 4.6, earnings: 9800 }
];
const ahmedabadZones = [
  { id: "1", name: "Satellite", area: "Satellite Road, Ahmedabad", deliveryTime: "10-20 mins", isActive: true, radius: "5 km", orders: 234 },
  { id: "2", name: "Vastrapur", area: "Vastrapur Lake Area, Ahmedabad", deliveryTime: "15-25 mins", isActive: true, radius: "4 km", orders: 189 },
  { id: "3", name: "Navrangpura", area: "C.G. Road, Navrangpura, Ahmedabad", deliveryTime: "12-22 mins", isActive: true, radius: "3 km", orders: 312 },
  { id: "4", name: "Bodakdev", area: "S.G. Highway, Bodakdev, Ahmedabad", deliveryTime: "15-30 mins", isActive: true, radius: "8 km", orders: 156 }
];
const seedDatabase = asyncHandler(async (req, res) => {
  {
    return res.status(403).json({ message: "Seeding is disabled in production." });
  }
});
const seedRouter = Router();
seedRouter.route("/").post(seedDatabase);
const getCustomers = asyncHandler(async (req, res) => {
  res.status(200).json(demoCustomers);
});
const customerRouter = Router();
customerRouter.route("/").get(getCustomers);
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "delivery_agent", "admin"], required: true },
  phone: { type: String },
  address: { type: String },
  vehicleNumber: { type: String }
}, { timestamps: true });
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, vehicleNumber } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Please provide all required fields: name, email, password, and role.");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }
  const user = new User({
    name,
    email,
    password,
    role,
    phone,
    address,
    vehicleNumber
  });
  const createdUser = await user.save();
  if (createdUser) {
    const { password: password2, ...userWithoutPassword } = createdUser.toObject();
    try {
      const { io: io2 } = await Promise.resolve().then(() => index);
      if (io2) {
        io2.emit("new-customer", userWithoutPassword);
      }
    } catch (error) {
      console.error("Socket emit failed:", error);
    }
    res.status(201).json(userWithoutPassword);
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password: enteredPassword } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (user && await user.matchPassword(enteredPassword)) {
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});
const authRouter = Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
const getAgents = asyncHandler(async (req, res) => {
  res.status(200).json(demoDeliveryAgents);
});
const agentRouter = Router();
agentRouter.route("/").get(getAgents);
const getZones = asyncHandler(async (req, res) => {
  res.status(200).json(ahmedabadZones);
});
const zoneRouter = Router();
zoneRouter.route("/").get(getZones);
const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String },
  count: { type: Number, default: 0 }
}, {
  timestamps: true
});
const Category = mongoose.model("Category", CategorySchema);
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.status(200).json(categories);
});
const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Please add a category name");
  }
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }
  const category = await Category.create({
    name,
    image
  });
  res.status(201).json(category);
});
const router = Router();
router.route("/").get(getCategories).post(createCategory);
const apiRouter = Router();
apiRouter.use("/seed", seedRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/customers", customerRouter);
apiRouter.use("/agents", agentRouter);
apiRouter.use("/zones", zoneRouter);
apiRouter.use("/categories", router);
dotenv.config();
let io;
function setupSocket(httpServer2) {
  io = new Server(httpServer2, {
    cors: {
      origin: "*",
      // Allow all origins for development
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
  return io;
}
function createServer() {
  connectDatabase();
  const app2 = express__default();
  const httpServer2 = createServer$1(app2);
  setupSocket(httpServer2);
  app2.use(cors());
  app2.use(express__default.json());
  app2.use("/api", apiRouter);
  app2.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: "🥞"
    });
  });
  app2.httpServer = httpServer2;
  return app2;
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServer,
  get io() {
    return io;
  },
  setupSocket
}, Symbol.toStringTag, { value: "Module" }));
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
const httpServer = app.httpServer;
httpServer.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
