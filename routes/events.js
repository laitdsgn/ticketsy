import express from "express";
import connect from "../public/mongoconnect.js";
import { db } from "../public/mongoconnect.js";
import { MongoClient, ObjectId } from "mongodb";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connect();
    res.render("events");
    console.log("events");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/ticket", async (req, res) => {
  const { id, seat, imie, nazwisko, wiek } = req.body;
  console.log(id, imie, seat, nazwisko, wiek);
});

router.get("/get-events", async (req, res) => {
  try {
    const events = await db.collection("events").find({}).toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

export default router;
