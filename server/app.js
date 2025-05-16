require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/db");
const { defineAssociations } = require("./src/initModels/Associations");
 
const userRoutes         = require("./src/routes/userRoutes");
const heroManagement     = require("./src/routes/heroManagementRoutes");
const userBlogs          = require("./src/routes/blogsRoutes");
const tagsRoutes         = require("./src/routes/tagsRoutes");
const categoriesRoutes   = require("./src/routes/categoriesRoutes");
const careersRoutes      = require("./src/routes/careersRoutes");
const settingsRoutes     = require("./src/routes/settingsRoute");
const contactRoutes      = require("./src/routes/contactRoutes");
const generalTalkRoutes  = require("./src/routes/generalTalkRoutes");
const jobAppsRoutes      = require("./src/routes/jobApplicationRoutes");
 
const app = express();
const PORT = Number(process.env.PORT) || 4009;
 
// set up table relations
defineAssociations();
 
// CORS + JSON
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));
app.use(express.json());
 
// health check
app.get("/", (req, res) => {
  res.send("Backend is up and running");
});
 
// mount routers
app.use("/api/users",           userRoutes);
app.use("/api/heroManagement",  heroManagement);
app.use("/api/blogs",           userBlogs);
app.use("/api/tags",            tagsRoutes);
app.use("/api/categories",      categoriesRoutes);
app.use("/api/careers",         careersRoutes);
app.use("/api/settings",        settingsRoutes);
app.use("/api/contactUs",       contactRoutes);
app.use("/api/generalTalk",     generalTalkRoutes);
app.use("/api/jobApplications", jobAppsRoutes);
 
// DB + server start
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
