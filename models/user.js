import mongoose from "mongoose";
import UniqueValidator from "mongoose-unique-validator";

/**
 * Represents the user schema.
 * @typedef {Object} UserSchema
 * @property {string} name - The name of the user. (required)
 * @property {string} email - The email of the user. (required, unique)
 * @property {string} password - The password of the user. (required, minimum length: 6)
 * @property {string} image - The image URL of the user. (required)
 * @property {Array<string>} places - The array of place IDs associated with the user. (required, references 'Place' model)
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(UniqueValidator);
export const User = mongoose.model("User", userSchema);
