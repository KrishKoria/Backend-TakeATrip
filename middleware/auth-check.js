import jwt from "jsonwebtoken";
import { HttpErrors } from "../models/http-errors.js";
import dotenv from "dotenv";

dotenv.config();

// Middleware function to check if the request has a valid token
export const checkToken = (req, res, next) => {
  // If the request method is OPTIONS, move to the next middleware
  if (req.method === "OPTIONS") {
    return next();
  }

  let token;
  try {
    // Extract the token from the Authorization header
    token = req.headers.authorization.split(" ")[1];
    if (!token) {
      // If no token is found, throw an error
      throw new Error("Authentication Failed, Please Try Again");
    }
  } catch (err) {
    // If an error occurs while extracting the token, return a 403 Forbidden error
    return next(new HttpErrors("Authentication Failed, Please Try Again", 403));
  }

  let decodedToken;
  try {
    // Verify the token using the secret key
    decodedToken = jwt.verify(token, process.env.JSON_SECRET_KEY);
    // Attach the decoded user data to the request object
    req.userData = { userId: decodedToken.userId };
    // Move to the next middleware
    next();
  } catch (err) {
    // If an error occurs while verifying the token, return a 500 Internal Server Error
    return next(new HttpErrors("Authentication Failed, Please Try Again", 500));
  }
};
