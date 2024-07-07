import { HttpErrors } from "../models/http-errors.js";
import { validationResult } from "express-validator";
import { getCoords } from "../Util/location.js";
import { Place } from "../models/place.js";
import { User } from "../models/user.js";
import mongoose from "mongoose";
import fs from "fs";

/**
 * Retrieves a place by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response containing the found place.
 * @throws {HttpErrors} - If an error occurs while finding the place.
 */
export const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let foundPlace;
  try {
    foundPlace = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpErrors("Something went wrong, could not find a place.", 500)
    );
  }
  if (!foundPlace) {
    return next(
      new HttpErrors("Could not find a place for the provided id.", 404)
    );
  }
  res.json({ place: foundPlace.toObject({ getters: true }) });
};

/**
 * Retrieves places by user ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object containing the places.
 * @throws {HttpErrors} - If fetching places fails or no place is found for the provided user ID.
 */
export const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userPlaces;
  try {
    userPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    return next(
      new HttpErrors("Fetching places failed, please try again", 500)
    );
  }
  if (!userPlaces || userPlaces.length === 0) {
    next(
      new HttpErrors("Could not find a place for the provided user id.", 404)
    );
  } else {
    res.json({
      places: userPlaces.places.map((place) =>
        place.toObject({ getters: true })
      ),
    });
  }
};

/**
 * Create a new place.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object containing the created place.
 * @throws {HttpErrors} - If there are invalid inputs, errors in getting coordinates, creating place, or finding user.
 */
export const createNewPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpErrors("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoords(address);
  } catch (err) {
    console.log(err);
    return next(new HttpErrors(err.message, 422));
  }
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(
      new HttpErrors("Creating place failed, please try again.", 500)
    );
  }
  if (!user) {
    return next(new HttpErrors("Could not find user for provided id.", 404));
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpErrors("Creating place failed, please try again.", 500)
    );
  }
  res.status(201).json({ place: createdPlace });
};

/**
 * Deletes a place.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object with a success message.
 */
export const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    place = await Place.findByIdAndDelete(placeId, {
      session: session,
    }).populate("creator");
    if (place.creator.id !== req.userData.userId) {
      return next(
        new HttpErrors("You are not allowed to delete this place.", 401)
      );
    }
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpErrors("Something went wrong, could not delete place.", 500)
    );
  }
  if (!place) {
    return next(new HttpErrors("Could not find place for this id.", 404));
  }
  fs.unlink(place.image, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place." });
};
/**
 * Update a place by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The updated place object.
 * @throws {HttpErrors} - If there is an error updating the place.
 */
export const updatePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  const { title, description } = req.body;
  let place;
  if (description !== undefined && description.length < 5) {
    return next(
      new HttpErrors("Description must be at least 5 characters long.", 422)
    );
  }

  try {
    place = await Place.findById(placeId);
    if (place.creator.toString() !== req.userData.userId) {
      return next(
        new HttpErrors("You are not allowed to edit this place.", 401)
      );
    }
    place.title = title || place.title;
    place.description = description || place.description;
    await place.save();
  } catch (err) {
    return next(
      new HttpErrors("Something went wrong, could not update place.", 500)
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};
