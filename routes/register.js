import express from "express";
import connect, { db } from "../public/mongoconnect.js";
import { ObjectId } from "mongodb";
const router = express.Router();

router.get("/", async (req, res) => {
  await connect();
  res.render("register");
  console.log("Register");
});

router.post("/", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (
    email.includes("@") &&
    email.includes(".") &&
    password === confirmPassword &&
    password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
  ) {
    try {
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
      res.redirect("/events");
    } catch (err) {
      if (err.code === 11000) {
        console.log("Email already exists");
        return res.render("error-email", {
          error_message: "Email już istnieje",
        });
      }
      return res.status(500).send("Server error: " + err);
    }
  } else {
    res.render("error-email");
  }
});

export default router;
