const Career = require("../models/careers");
const { parseRequestFiles } = require("../utils/requestedFiles");
const  uploadFile  = require('../utils/fileUpload');
const ALLOWED_USER_DOC_TYPES = require('../utils/alloweTypes');
const {uploadFiles} = require('../controllers/blogsController');
const Category = require("../models/categories");
const { Op } = require("sequelize");


// const createCareer = async (req, res) => {
//   try {
//     const {files,fields} = await parseRequestFiles(req);
//     if (files && Object.keys(files).length>0) {
//         req.body = {};
//         for (const [key, value] of Object.entries(fields)) {
//           req.body[key] = value[0];
//         }
//           const {body} = req
//           const data = body;
//             const uploadData = await uploadFiles([
//               files.content[0]
//             ]);
//             let contentData = [];

//             if (req.body.paragraphs) {
        
//               try {
//                 let paragraphs = req.body.paragraphs;
            
//                 if (typeof paragraphs === "string") {
//                   paragraphs = JSON.parse(paragraphs);
//                 }
            
//                 if (Array.isArray(paragraphs)) {
//                   paragraphs.forEach(text => {
//                     contentData.push({ type: "text", text }); 
//                   });
         
//                 } else {
//                   console.log("Invalid paragraph format:", paragraphs);
//                 }
//               } catch (error) {
//                 console.error("Error parsing paragraphs JSON:", error.message);
//               }
//             }

//             if (uploadData) {
//                 contentData.push({
//                     type: "image",
//                     url: uploadData.profileUrl,
//                   }); 
//               }
//               data.content = contentData;
//           const Blogs = await Career.create(data);
//           res.status(201).json({success: true, message: 'Career Created Successfully', data: Blogs})
        
//       }
//   } catch (error) {
//     res.status(500).json({ error: "Error creating career" });
//   }
// };




const createCareer = async (req, res) => {
    try {
      const { files, fields } = await parseRequestFiles(req);
      
      req.body = {};
      for (const [key, value] of Object.entries(fields)) {
        req.body[key] = value[0]; 
      }
  
      const { body } = req;
      const data = body;
      let contentData = [];
  

   

    // if (req.body.paragraphs) {
    //     console.log("Parsing paragraphs...");
    //     try {
    //       const paragraphHTML = req.body.paragraphs.trim(); 
      
    //       if (paragraphHTML) {
    //         contentData.push({
    //           type: "html",
    //           text: paragraphHTML, 
    //         });
    //         console.log("Final contentData:", contentData);
    //       } else {
    //         console.log("Empty paragraph content received.");
    //       }
    //     } catch (error) {
    //       console.error("Error processing paragraphs:", error.message);
    //     }
    //   }

    if (req.body.paragraphs) {
        console.log("Parsing paragraphs...");
        try {
            const paragraphHTML = req.body.paragraphs.trim();
    
            if (paragraphHTML) {
              
                contentData.push({
                    type: "html",
                    text: paragraphHTML,
                    url: null 
                });
                console.log("Final contentData:", contentData);
            } else {
                console.log("Empty paragraph content received.");
            }
        } catch (error) {
            console.error("Error processing paragraphs:", error.message);
        }
    }
      
    
      data.content = contentData;
      
    //   console.log("Final data before file upload:", data);
      
      if (files && Object.keys(files).length > 0 && files.content) {
        const uploadData = await uploadFiles([files.content[0]]);
        if (uploadData) {
            if (contentData.length > 0) {
                contentData[0].url = uploadData.profileUrl;
            } else {
                contentData.push({
                    type: "html",
                    text: "",
                    url: uploadData.profileUrl
                });
            }
        }
    }

      data.content = contentData.length > 0 ? contentData : null;
  

      const careerEntry = await Career.create(data);
      
      return res.status(201).json({
        success: true,
        message: "Career Created Successfully",
        data: careerEntry
      });
  
    } catch (error) {
      console.error("Error creating career:", error);
      return res.status(500).json({ error: "Error creating career" });
    }
  };
  


// const getAllCareers = async (req, res) => {
//   try {
//     let { page, limit } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     const offset = (page - 1) * limit;
//     try {
//         const { count, rows: careers } = await Career.findAndCountAll({
//             limit,
//             offset,
//             include: [
//                 {
//                   model: Category,
//                   as: "departmentInfo",
//                   attributes: ["name"],
//                 },
//               ],
//           });
//           res.json({
//             totalItems: count,
//             totalPages: Math.ceil(count / limit),
//             currentPage: page,
//             data: careers,
//           });
//     } catch (error) {
//         console.log('errrr',error)
//     }
    
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching careers" });
//   }
// };


const getAllCareers = async (req, res) => {
    try {
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const offset = (page - 1) * limit;
  
      const { count, rows } = await Career.findAndCountAll({
        limit,
        offset,
        include: [
          {
            model: Category,
            as: "departmentInfo",
            attributes: ["name"],
          },
        ],
        raw: false,
        nest: true,
      });
  
      // Transform the response
      const careers = rows.map(career => {
        const careerData = career.toJSON();
        careerData.department = careerData.departmentInfo?.name || null;
        delete careerData.departmentInfo;
        return careerData;
      });
  
      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: careers,
      });
    } catch (error) {
      console.error("Error fetching careers:", error);
      res.status(500).json({ error: "Error fetching careers" });
    }
  };
  




const getCareerById = async (req, res) => {
    try {
      const id = req.params.id;
  
      const career = await Career.findOne({
        where: { id: id },
        include: [{
          model: Category,
          as: 'departmentInfo',
          attributes: ['name']
        }],
        raw: false,
        nest: true
      });
  
      if (!career) {
        return res.status(404).json({ error: "Career not found" });
      }
  
      // Convert to plain JS object
      const careerData = career.toJSON();
  
      // Replace department with just the name
      careerData.department = careerData.departmentInfo.name;
  

      delete careerData.departmentInfo;
  
      res.json(careerData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching career" });
    }
  };
  
  


const updateCareer = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('iddddd', id);
        let career = await Career.findByPk(req.params.id);
        if (!career) return res.status(404).json({ error: "Career not found" });

        const { files, fields } = await parseRequestFiles(req);
      
        req.body = {};
        for (const [key, value] of Object.entries(fields)) {
          req.body[key] = value[0]; 
        }

        const { body } = req;
        const updateData = body;
        let contentData = [];
      
  
  
      if (req.body.paragraphs) {
        console.log("Parsing paragraphs...");
        try {
          const paragraphHTML = req.body.paragraphs.trim(); 
      
          if (paragraphHTML) {
            contentData.push({
              type: "html",
              text: paragraphHTML, 
            });
            console.log("Final contentData:", contentData);
          } else {
            console.log("Empty paragraph content received.");
          }
        } catch (error) {
          console.error("Error processing paragraphs:", error.message);
        }
      }
      updateData.content = contentData;
      console.log('kkkkksssss', contentData[0]);
      console.log("updated data:", updateData);
      if (files && Object.keys(files).length > 0 && files.content) {
        const uploadData = await uploadFiles([files.content[0]]);
        if (uploadData) {
          contentData[0].url = uploadData.profileUrl;
        }
      }
      if (!updateData.content || (Array.isArray(updateData.content) && updateData.content.length === 0)) {
        updateData.content = career.content || [];
      }
      console.log('updateeeee payloaddddssaaaa', updateData);
      const updatedData = await Career.update(updateData,{where: {id:id}});
      console.log('updated dataaaa',updatedData);
      res.json({ success: true, message: "Career updated successfully" });
    } catch (error) {
      console.error("Error updating career:", error);
      res.status(500).json({ error: "Error updating career" });
    }
  };
  

const deleteCareer = async (req, res) => {
  try {
    const career = await Career.findByPk(req.params.id);
    if (!career) return res.status(404).json({ error: "Career not found" });

    await career.destroy();
    res.json({ message: "Career deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting career" });
  }
};


// const searchCareers = async (req, res) => {
//     try {
//       const { role, page = 1, limit = 10 } = req.query;
//       const offset = (parseInt(page) - 1) * parseInt(limit);
  
//       const { rows: careers, count } = await Career.findAndCountAll({
//         where: {
//           ...(role && { role: { [Op.iLike]: `%${role}%` } }),
//         },
//         limit: parseInt(limit),
//         offset,
//       });
  
//       const totalPages = Math.ceil(count / limit);
  
//       res.status(200).json({
//         success: true,
//         data: careers,
//         pagination: {
//           totalItems: count,
//           totalPages,
//           currentPage: parseInt(page),
//           perPage: parseInt(limit),
//         },
//       });
//     } catch (error) {
//       console.error("Error searching careers:", error);
//       res.status(500).json({ error: "Error searching careers" });
//     }
//   };


const searchCareers = async (req, res) => {
    try {
      let { role, page, limit } = req.query;
  
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const offset = (page - 1) * limit;
  
      const { rows: careers, count } = await Career.findAndCountAll({
        where: {
          ...(role && { role: { [Op.iLike]: `%${role}%` } }),
        },
        limit,
        offset,
      });
  
      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: careers,
      });
    } catch (error) {
      console.error("Error searching careers:", error);
      res.status(500).json({ error: "Error searching careers" });
    }
  };

module.exports = { createCareer, getAllCareers, getCareerById, updateCareer, deleteCareer, searchCareers };
