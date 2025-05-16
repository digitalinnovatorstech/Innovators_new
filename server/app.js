require("dotenv").config();
const express = require("express");
const sequelize = require('./src/config/db');
const cors = require("cors");

const {defineAssociations} = require('./src/initModels/Associations');
const userRoutes = require("./src/routes/userRoutes");
const heroManagement = require('./src/routes/heroManagementRoutes');
const userBlogs = require('./src/routes/blogsRoutes');
const tags = require('./src/routes/tagsRoutes');
const categories = require('./src/routes/categoriesRoutes');
const careers = require('./src/routes/careersRoutes');
const settings = require('./src/routes/settingsRoute');
const contactUs = require('./src/routes/contactRoutes');
const generaltalk = require("./src/routes/generalTalkRoutes");
const jobApplications = require('./src/routes/jobApplicationRoutes');

const app = express();
const PORT =  process.env.PORT || '4009';

defineAssociations();

app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, 
  }));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use('/api/heroManagement', heroManagement);
app.use('/api/blogs', userBlogs);
app.use('/api/tags', tags);
app.use('/api/categories', categories);
app.use('/api/careers', careers);
app.use('/api/settings', settings);
app.use('/api/contactUs', contactUs);
app.use('/api/generalTalk', generaltalk);
app.use('/api/jobApplications', jobApplications);

app.get("/", (req, res) => {
  res.send("Backend is up and running ");
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected...');
    // return sequelize.sync({ alter: true }); 
  })
  .catch((error) =>  { console.error('Unable to connect to the database:', error)});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
