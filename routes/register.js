import express from "express";
import connect from "../public/mongoconnect.js";
import { db } from "../public/mongoconnect.js";
import { MongoClient, ObjectId } from "mongodb";
const router = express.Router();

router.get("/", (req, res) => {
  connect();
  res.render("register");
  console.log("Register");
});

router.post("/", async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  await db.collection("users").insertOne({
    _id: new ObjectId(),
    email: email,
    password: password,
    role: "user",
    createdAt: new Date().toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
  });
});

export default router;
