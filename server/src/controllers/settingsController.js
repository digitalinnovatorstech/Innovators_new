const Settings = require("../models/settings");
const {uploadFiles} = require("../controllers/blogsController"); // Assuming you have a file upload function
const { parseRequestFiles } = require("../utils/requestedFiles");





const createSettings = async (req, res) => {
    try {
        const { files, fields } = await parseRequestFiles(req);
        if(files?.image){
            let imgage = files?.image ? await uploadFiles([files.image[0]]) : null;
            return imgage.profileUrl;
        }
      let dashboardLogo = files?.dashboardLogo ? await uploadFiles([files.dashboardLogo[0]]) : null;
      let favicon = files?.favicon ? await uploadFiles([files.favicon[0]]) : null;
        
      let socialMediaData = [];
      const socialMedia  = fields.socialMedia;

      if (socialMedia) {
        const socialMediaArray = JSON.parse(socialMedia); 
  
        for (let i = 0; i < socialMediaArray.length; i++) {
          let imageUrl = null;
  
          
          if (files?.[`socialMediaImage${i}`]) {
            const uploadedImage = await uploadFiles([files[`socialMediaImage${i}`][0]]);
            imageUrl = uploadedImage.profileUrl;
          }
  
          socialMediaData.push({
            socialMediaUrl: socialMediaArray[i].socialMediaUrl,
            imageUrl: imageUrl || null,
          });
        }
      }
      const settings = await Settings.create({
        dashboardLogo: dashboardLogo ? dashboardLogo.profileUrl : null,
        favicon: favicon ? favicon.profileUrl : null,
        socialMedia: socialMediaData,
      });
  
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


const updateSettings = async (req, res) => {
    try {
      const { id } = req.params;
      const { files, fields } = await parseRequestFiles(req);
      const  socialMedia  = fields.socialMedia;
  
      let settings = await Settings.findByPk(id);
      if (!settings) return res.status(404).json({ error: "Settings not found" });
  
      let dashboardLogo = settings.dashboardLogo;
      let favicon = settings.favicon;
      let socialMediaData = settings.socialMedia || [];
  

      if (files?.dashboardLogo) {
        const uploadedLogo = await uploadFiles([files.dashboardLogo[0]]);
        dashboardLogo = uploadedLogo.profileUrl;
      }
  
  
      if (files?.favicon) {
        const uploadedFavicon = await uploadFiles([files.favicon[0]]);
        favicon = uploadedFavicon.profileUrl;
      }
  
 


    if (socialMedia) {
        const socialMediaArray = JSON.parse(socialMedia);
        
        // Keep previous social media data
        const previousDataMap = new Map(
          (settings.socialMedia || []).map((item) => [item.socialMediaUrl, item.imageUrl])
        );
      
        socialMediaData = [];
      
        for (let i = 0; i < socialMediaArray.length; i++) {
          let imageUrl = previousDataMap.get(socialMediaArray[i].socialMediaUrl) || null;
      
          if (files?.[`socialMediaImage${i}`]) {
            const uploadedImage = await uploadFiles([files[`socialMediaImage${i}`][0]]);
            imageUrl = uploadedImage.profileUrl;  // Use new uploaded image
          }
      
          socialMediaData.push({
            socialMediaUrl: socialMediaArray[i].socialMediaUrl,
            imageUrl,
          });
        }
      }
      
  
      settings = await settings.update({
        dashboardLogo,
        favicon,
        socialMedia: socialMediaData,
      });
  
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createSettings, updateSettings, getSettings };
