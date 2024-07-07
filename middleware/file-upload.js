import multer from "multer"; // Importing the multer library for file uploads
import { v1 as uuidv1 } from "uuid"; // Importing the uuid library for generating unique filenames

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// Creating a middleware function for file uploads
export const fileUpload = multer({
  limits: 500000, // Setting the maximum file size limit to 500KB
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images"); // Setting the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype]; // Getting the file extension based on the MIME type
      cb(null, uuidv1() + "." + ext); // Generating a unique filename using uuid and the file extension
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // Checking if the file MIME type is valid
    let error = isValid ? null : new Error("Invalid mime type!"); // Creating an error if the MIME type is invalid
    cb(error, isValid); // Passing the error and validity status to the callback function
  },
});
