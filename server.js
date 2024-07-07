import express from "express";
import bodyParser from "body-parser";
import { placesRoutes } from "./routes/places-routes.js";
import { userRoutes } from "./routes/user-routes.js";
import mongoose from "mongoose";
import { HttpErrors } from "./models/http-errors.js";
import fs from "fs";
import * as path from "path";

const app = express();

// Parsing incoming requests with JSON payloads
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Private-Network", true);
  next();
});

// Registering routes for places and users
app.use("/api/places", placesRoutes);
app.use("/api/users", userRoutes);

// Serving static images from the 'uploads/images' directory
app.use("/uploads/images", express.static(path.join("uploads", "images")));

// Handling unknown routes
app.use((req, res, next) => {
  next(new HttpErrors("Could not find this route.", 404));
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Deleting uploaded file if it exists
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  // Checking if headers have already been sent
  if (res.headerSent) {
    return next(error);
  }
  // Sending error response
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

// Connecting to MongoDB and starting the server
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sirovsp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running on port 5000!")
    );
  })
  .catch((err) => {
    console.log(err);
  });
