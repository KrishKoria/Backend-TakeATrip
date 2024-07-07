import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * Represents a place schema.
 * @typedef {Object} PlaceSchema
 * @property {string} title - The title of the place.
 * @property {string} description - The description of the place.
 * @property {string} image - The image URL of the place.
 * @property {string} address - The address of the place.
 * @property {Object} location - The location coordinates of the place.
 * @property {number} location.lat - The latitude of the place.
 * @property {number} location.lng - The longitude of the place.
 * @property {mongoose.Types.ObjectId} creator - The ID of the user who created the place.
 */
const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

export const Place = mongoose.model("Place", placeSchema);
