const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME || "postgres", process.env.DB_USER || "innovatoradmin", process.env.DB_PASS || "StrongPassHere", {
  host: process.env.DB_HOST || "database-1.clgko8u2uej1.ap-south-2.rds.amazonaws.com",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Require SSL
      rejectUnauthorized: false // Allow self-signed certificates
    }
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

module.exports = sequelize;