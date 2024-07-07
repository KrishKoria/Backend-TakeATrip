import axios from "axios";
import { HttpErrors } from "../models/http-errors.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Retrieves the coordinates (latitude and longitude) for a given address using the Google Geocoding API.
 * @param {string} address - The address to retrieve coordinates for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the latitude and longitude.
 * @throws {HttpErrors} - Throws an HttpErrors object if the address is not found or the API request fails.
 */
export const getCoords = async (address) => {
  // Make a GET request to the Google Geocoding API
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );
  const data = response.data;

  // Check if the response is empty or if the status is 'ZERO_RESULTS'
  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpErrors(
      "Could not find location for the specified address.",
      422
    );
  }

  // Return the coordinates of the first result
  return data.results[0].geometry.location;
};
