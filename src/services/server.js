import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Connection error:", err));

import Card from "../models/Card.js";

app.post("/api/add", async (req, res) => {
  const { id, description, created, time, urgency, stopped } = req.body;
  console.log(req.body);
  try {
    const newCard = new Card({
      id,
      description,
      created,
      time,
      urgency,
      stopped,
    });

    await newCard.save();
    res.status(201).send({ message: "Card added to the DB", card: newCard });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error while adding the card in the DB", error: err });
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCard = await Card.findOneAndDelete({ id: Number(id) });
    if (!deletedCard) {
      return res.status(404).send({ message: "Card not found" });
    }

    res
      .status(200)
      .send({ message: "Card deleted successfully", card: deletedCard });
  } catch (err) {
    res.status(500).send({ message: "Error deleting card", error: err });
  }
});

app.get("/api/getcards", async (req, res) => {
  try {
    const foundCards = await Card.find();
    if (foundCards.length === 0) {
      return res.status(200).send([]);
    }
    res.status(200).send(foundCards);
  } catch (err) {
    console.error("Error occurred:", err);
    res
      .status(500)
      .send({ message: "Error occurred while fetching cards", error: err });
  }
});

app.put("/api/updateStatus", async (req, res) => {
  const { id, time, stopped } = req.body;

  try {
    const updatedCard = await Card.findOneAndUpdate(
      { id },
      { time, stopped },
      { new: true }
    );
    if (!updatedCard) {
      return res.status(404).send({ message: "Card not found" });
    }

    res
      .status(200)
      .send({ message: "Card updated successfully", card: updatedCard });
  } catch (err) {
    res.status(500).send({ message: "Error updating card", error: err });
  }
});

app.put("/api/updateUrgency", async (req, res) => {
  const { id, urgency } = req.body;

  try {
    const updateCard = await Card.findOneAndUpdate(
      { id },
      { urgency },
      { new: true }
    );
    if (!updateCard) {
      return res.status(404).send({ message: "Card not found" });
    }
    res
      .status(200)
      .send({ message: "Urgency updated successfully", card: updateCard });
  } catch (err) {
    res.status(500).send({ message: "Error updating urgency", error: err });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
