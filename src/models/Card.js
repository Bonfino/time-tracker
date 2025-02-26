import mongoose from "mongoose";

const cardScheme = new mongoose.Schema({
  id: {type: String},
  description: { type: String },
  created: { type: String },
  time: { type: Number },
  stopped: {type: Boolean}
});

const Card = mongoose.model("Card", cardScheme);

export default Card;
