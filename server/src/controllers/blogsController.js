const Blog = require("../models/blogs");
const {parseRequestFiles} = require('../utils/requestedFiles');
const  uploadFile  = require('../utils/fileUpload');
const ALLOWED_USER_DOC_TYPES = require('../utils/alloweTypes');
const Tag = require("../models/tags");
const Category = require("../models/categories");
const { Op } = require("sequelize");
const { getCategoryById } = require("./categoryController");
const Career = require("../models/careers");


const uploadFiles = async (files) => {
    console.log('filesssssssiimmmm', files)
    const uploadPromises = files.map((file) => uploadFile(file, ALLOWED_USER_DOC_TYPES));
    if (!uploadPromises) {
        return { success: false, message: "Please check file typesssss" };
    }
    try {
      const results = await Promise.all(uploadPromises);
      console.log(results,"results")
      if (results.length>1) {
        console.log("lloppppp");
        return results;
      } else {
        const uploadedData = {
          profileUrl: results[0].success ? results[0].url : null,
        };
        console.log(uploadedData,"datauploaded")
        return uploadedData;
      }
     
    } catch (error) {
      console.log("errorrr", error);
      throw error;
    }
  };

// const createBlog = async (req, res) => {
//   try {
//     // console.log('sssssssaa', )
//     const {files,fields} = await parseRequestFiles(req);
//     // console.log('llkkkkaaaa', files, fields)
//     if (files && Object.keys(files).length>0) {
//         // console.log('kkksslsss', files)
//         req.body = {};
//         for (const [key, value] of Object.entries(fields)) {
//           req.body[key] = value[0];
//         }
//           const {body} = req
//           const data = body;
//             // console.log("sndsdjcnds",files.image[0]);
//             const uploadData = await uploadFiles([
//               files.image[0]
//             ]);
//             // console.log(uploadData.profileUrl,"sjnsjdssssssssss",uploadData);
            
//             data.image = uploadData.profileUrl;
//             // console.log('llldataaaaimageee', data.image, 'daatataaaaa', data)
//           const Blogs = await Blog.create(data);
//           res.status(201).json({success: true, message: 'Blog Created Successfully', data: Blogs})
        
//       }
//     // const { image, name, categories, author, status } = req.body;
//     // const newBlog = await Blog.create({ image, name, categories, author, status });
//     // res.status(201).json(newBlog);
//   } catch (error) {
//     res.status(500).json({ error: "Error creating blog" });
//   }
// };


const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

const generateUniquePermalink = async (title, BlogModel) =>{
  let basePermalink = slugify(title);
  let permalink = basePermalink;
  let suffix = 1;

  while (await BlogModel.findOne({where:{permalink}})){
    permalink = `${basePermalink} - ${suffix++}`;
  }

  return permalink;
}

const createBlog = async (req, res) => {
  try {
    const { files, fields } = await parseRequestFiles(req);
    // console.log("fileesssss", files, "fieldssssss", fields);
    
    // Flatten fields
    const body = {};
    for (const [key, value] of Object.entries(fields)) {
      body[key] = value[0];
    }
    // console.log("boooodd", body);
    

    if (files.image && files.image.length > 0) {
      const uploadBanner = await uploadFiles([files.image[0]]);
      
      body.image = uploadBanner.profileUrl;
    }
    
    // Parse content_structure from JSON
    let contentStructure = JSON.parse(body.content_structure || "[]");
    // console.log("hbhbhbhbhb",contentStructure);
    
    // Handle embedded images in content_structure
    const updatedContentStructure = await Promise.all(
      contentStructure.map(async (block) => {
        if (block.type === "image" && files[`content_${block.value}`]) {
          const file = files[`content_${block.value}`][0];
          const uploaded = await uploadFiles([file]);
          return { type: "image", value: uploaded.profileUrl };
        }
        return block;
      })
    );
    // console.log('llkddlkdldd', updatedContentStructure)
    body.content_structure = updatedContentStructure;
    // console.log("iejiejfiefe",body);
    
    // Convert other fields as needed
    if (body.tags) body.tags = JSON.parse(body.tags);
    if (body.comments) body.comments = body.comments === "1" ? true : false;
    if (body.category) body.category = parseInt(body.category);

    // console.log("oeoepeoeurur", body);
    body.category = Array.isArray(body.category) ? body.category : [body.category];
    body.tags = Array.isArray(body.tags) ? body.tags : [body.tags];
    // console.log('boodddydddd', body);
    const blog = await Blog.create(body);

    res.status(201).json({
      success: true,
      message: "Blog Created Successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Blog Creation Error:", error);
    res.status(500).json({ error: "Error creating blog" });
  }
};




// const getAllBlogs = async (req, res) => {
//   try {
//     let { page, limit } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     const offset = (page - 1) * limit;

//     const { count, rows: blogs } = await Blog.findAndCountAll({ limit, offset });

//     res.json({
//       totalItems: count,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//       data: blogs,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching blogs" });
//   }
// };


const getAllBlogs = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10; 
      const offset = (page - 1) * limit;
      const id = req.query.categoryId;
      const dataType = req.query.type;
      if (dataType === 'category') {
        const categoryData = await Category.findOne({ where: { id: id } });
        if (!categoryData) return res.status(404).json({ error: "Record not found" });
  
        if (categoryData.type === 'category') {
          try {
            const { count, rows: blogs } = await Blog.findAndCountAll({
              where: { category: id }, // adjust based on your schema
              offset,
              limit,
              include: [{
                model: Category,
                as: 'categories'
              }],
              order: [['createdAt', 'DESC']],
            });
  
            const allTags = await Tag.findAll();
            const tagMap = {};
            allTags.forEach(tag => {
              tagMap[tag.id] = tag;
            });
  
            const blogsWithTags = blogs.map(blog => {
              const tagIds = blog.tags || [];
              const fullTags = tagIds.map(tagId => tagMap[tagId]).filter(Boolean);
              return {
                ...blog.toJSON(),
                tags: fullTags,
              };
            });
  
            const totalPages = Math.ceil(count / limit);
  
            return res.status(200).json({
              success: true,
              data: blogsWithTags,
              pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                perPage: limit,
              },
            });
          } catch (error) {
            return res.status(500).json({ error: "Error fetching blogs by category" });
          }
        }
      }
  
      const { count, rows: blogs } = await Blog.findAndCountAll({
        offset,
        limit,
        include:[{
            model: Category,
            as: 'categories'
        }],
        order: [['createdAt', 'DESC']], 
      });
  
     
      const allTags = await Tag.findAll();
      const tagMap = {};
      allTags.forEach(tag => {
        tagMap[tag.id] = tag;
      });
  
   
      const blogsWithTags = blogs.map(blog => {
        const tagIds = blog.tags || [];
        const fullTags = tagIds.map(tagId => tagMap[tagId]).filter(Boolean);
        return {
          ...blog.toJSON(),
          tags: fullTags,
        };
      });
  
      const totalPages = Math.ceil(count / limit);
  
      res.status(200).json({
        success: true,
        data: blogsWithTags,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ success: false, message: "Error fetching blogs" });
    }
  };


// const getBlogById = async (req, res) => {
//   try {
//     const blog = await Blog.findByPk(req.params.id);
//     if (!blog) return res.status(404).json({ error: "Blog not found" });
//     res.json(blog);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching blog" });
//   }
// };


const getBlogById = async (req, res) => {
  try {
    const id = req.params.id;
    const dataType = req.query.type;
    console.log('dddddddsss',id,'idddddd', dataType)
    if (dataType === 'category') {
        const categoryData = await Category.findOne({where: {id: id}});
    if (!categoryData) return res.status(404).json({ error: "Record not found" });
    console.log('111111111',categoryData);
    
    if (categoryData.type === 'category'){
        try {
            console.log('2222222222222');
            
            const category = await Category.findOne({
                where: { id: id },
                include: [{
                    model: Blog,
                    as: 'blogs' 
                }]
            });
            console.log('33333333333',category);
            res.json(category);
        } catch (error) {
            res.status(500).json({ error: "Error fetching department" });
        }
    }

    }
  
    const blog = await Blog.findOne({where:{id:id},
        include:[{
            model: Category,
            as: 'categories'
        }],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Get all tag details if tags are stored as IDs in array
    const tagIds = blog.tags || [];

    const tags = await Tag.findAll({
      where: { id: tagIds },
    });

    const blogWithTags = {
      ...blog.toJSON(),
      tags,
    };

    res.status(200).json({
      success: true,
      data: blogWithTags,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "Error fetching blog" });
  }
};



const updateBlog = async (req, res) => {
    try {
      const blogId = req.params.id;
      const existingBlog = await Blog.findByPk(blogId);
      if (!existingBlog) return res.status(404).json({ error: "Blog not found" });
  
      const { files, fields } = await parseRequestFiles(req);
  
      req.body = {};
      for (const [key, value] of Object.entries(fields)) {
        req.body[key] = value[0];
      }
  
      const body = req.body;
      const data = { ...body };
      if (data.tags) {
        if (typeof data.tags === "string") {
          try {
            data.tags = JSON.parse(data.tags);
          } catch {
            data.tags = [data.tags];
          }
        }
      } else {
        data.tags = existingBlog.tags; // fallback to existing
      }
      
      if (data.content_structure) {
        if (typeof data.content_structure === "string") {
          try {
            data.content_structure = JSON.parse(data.content_structure);
          } catch {
            data.content_structure = existingBlog.content_structure;
          }
        }
      } else {
        data.content_structure = existingBlog.content_structure;
      }
      const contentStructure = JSON.parse(body.content_structure || "[]");
    
  
      // Handle blog banner image
      if (files.image && files.image[0]) {
        const uploadData = await uploadFiles([files.image[0]]);
        data.image = uploadData.profileUrl;
      }
  
      // Handle content images
      const updatedStructure = await Promise.all(
        data.content_structure.map(async (item) => {
          if (item.type === "image" && files[`content_${item.value}`]) {
            const uploaded = await uploadFiles([files[`content_${item.value}`][0]]);
            return {
              type: "image",
              value: uploaded.profileUrl,
            };
          }
          return item;
        })
      );
  
      data.content_structure = updatedStructure;
  
      // Update blog
      await Blog.update(data, { where: { id: blogId } });
  
      const updatedBlog = await Blog.findByPk(blogId);
      res.status(200).json({ success: true, message: "Blog updated successfully", data: updatedBlog });
    } catch (error) {
      console.error("Error updating blog:", error);
      res.status(500).json({ error: "Error updating blog" });
    }
  };

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    await blog.destroy();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting blog" });
  }
};


const searchBlogs = async (req, res) => {
    try {
      const { title, category, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
  console.log('titleee', page, limit)
      // Count total matching blogs
      const { rows: blogs, count } = await Blog.findAndCountAll({
        where: {
          ...(title && { title: { [Op.iLike]: `%${title}%` } }),
        },
        include: [
          {
            model: Category,
            as: 'categories',
            where: category ? { name: { [Op.iLike]: `%${category}%` } } : undefined,
            attributes: ['name'],
          },
        ],
        limit: parseInt(limit),
        offset,
      });
      console.log('blogssss', blogs);
      const totalPages = Math.ceil(count / limit);
  
      res.status(200).json({
        success: true,
        data: blogs,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          perPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error searching blogs:", error);
      res.status(500).json({ error: "Error searching blogs" });
    }
  };


module.exports = { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog, uploadFiles, searchBlogs };
