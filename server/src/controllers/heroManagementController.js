const { Op } = require("sequelize");
const heroManagement = require("../models/heroManagement");
const cache = require("../config/cache");

const createHeroManagement = async (req, res) => {
  try {
    const data = req.body;
    const newBlog = await heroManagement.create(data);
    cache.flushAll();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ error: "Error creating Hero Management" });
  }
};

const getHeroManagement = async (req, res) => {
    try {
      let { page, limit } = req.query;
  
      // Default values
      page = parseInt(page) || 1;  // Default page = 1
      limit = parseInt(limit) || 10; // Default limit = 10
  
      const offset = (page - 1) * limit;

      const cacheKey = `hero_page_${page}_limit_${limit}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        console.log("⏳ Serving from cache");
        return res.json(cachedData);
      }
  
      const { count, rows: blogs } = await heroManagement.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const result = {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: blogs,
      };

      cache.set(cacheKey, result); // Store in cache
      console.log("✅ Cached new data");

      res.json(result);
  
    //   res.json({
    //     totalItems: count,
    //     totalPages: Math.ceil(count / limit),
    //     currentPage: page,
    //     data: blogs,
    //   });
    } catch (error) {
      res.status(500).json({ error: "Error fetching Hero Management" });
    }
  };
  

const getHeroManagementById = async (req, res) => {
  try {
    const blog = await heroManagement.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ error: "Hero Management not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Error fetching Hero Management" });
  }
};

// const updateHeroManagement = async (req, res) => {
//   try {
//     const data = req.body;
//     const hero = await heroManagement.findByPk(req.params.id);
//     if (!hero) return res.status(404).json({ error: "Hero Management not found" });
//     console.log('datttaaa',data,'herrroo', hero);
//     if (data.status === 'publish') {
//         const publishedHero = await heroManagement.findOne({
//             where: { status: "publish" },
//           });
//           console.log('publishhhhh',publishedHero);
//           if (publishedHero && data.status === "publish") {
//             console.log('eeeeeeeentrrrr');
//             throw new Error("Update failed: A 'published' entry already exists. Please change the existing published status to 'draft' before proceeding.");
//           }
//     }
    
//     const updatedData = await hero.update(data);
//     res.json(hero);
//   } catch (error) {
//     console.log('Caught Error:', error.message);
//     res.status(500).json({ error: "Error updating Hero Management" });
//   }
// };

const updateHeroManagement = async (req, res) => {
    try {
      const data = req.body;
      const hero = await heroManagement.findByPk(req.params.id);
  
      if (!hero) {
        return res.status(404).json({ error: "Hero Management not found" });
      }
  
      // If updating to 'publish', set all others to 'draft'
      if (data.status === 'publish') {
        const publishedHero = await heroManagement.findOne({
          where: { status: "publish" },
        });
  
        if (publishedHero && publishedHero.id !== hero.id) {
          // Automatically change the existing published to draft
          await publishedHero.update({ status: 'draft' });
        }
      }
  
      // Update current hero with new data
      await hero.update(data);
  
      return res.status(200).json({
        success: true,
        message: "Hero updated successfully",
        data: hero
      });
  
    } catch (error) {
      console.error("Caught Error:", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  };
  


const deleteHeroManagement = async (req, res) => {
  try {
    const blog = await heroManagement.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ error: "Hero Management not found" });
    await blog.destroy();
    res.json({ message: "Hero Management deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting Hero Management" });
  }
};


// const searchHeroSections = async (req, res) => {
//     try {
//       const { title, subtitle } = req.query;
  
//       const heroes = await heroManagement.findAll({
//         where: {
//           ...(title && { title: { [Op.iLike]: `%${title}%` } }),
//           ...(subtitle && { subtitle: { [Op.iLike]: `%${subtitle}%` } }),
//         },
//       });
  
//       res.status(200).json(heroes);
//     } catch (error) {
//       res.status(500).json({ error: "Error searching hero sections" });
//     }
//   };


const searchHeroSections = async (req, res) => {
    try {
      let { title, subtitle, page, limit } = req.query;
  
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const offset = (page - 1) * limit;
  
      const { rows: heroes, count } = await heroManagement.findAndCountAll({
        where: {
          ...(title && { title: { [Op.iLike]: `%${title}%` } }),
          ...(subtitle && { subtitle: { [Op.iLike]: `%${subtitle}%` } }),
        },
        limit,
        offset,
      });
  
      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: heroes,
      });
    } catch (error) {
      console.error("Error searching hero sections:", error);
      res.status(500).json({ error: "Error searching hero sections" });
    }
  };
  

module.exports = { createHeroManagement, getHeroManagement, getHeroManagementById, updateHeroManagement, deleteHeroManagement, searchHeroSections };
