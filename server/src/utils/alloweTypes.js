const  ALLOWED_USER_DOC_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/jpg",
    "application/png",
    "application/msword",              // For .doc files
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // For .docx files
    "application/vnd.ms-excel",        // For .xls files
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // For .xlsx files
];
 
module.exports = ALLOWED_USER_DOC_TYPES;