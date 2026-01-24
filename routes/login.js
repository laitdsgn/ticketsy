import express from "express";
import connect, { db } from "../public/mongoconnect.js";
const router = express.Router();

router.get("/", async (req, res) => {
  await connect();
  console.log("login");
  res.render("login");
});

router.post("/", async (req, res) => {
  await connect();
  const { email, password, remember } = req.body;

  const rememberMe = remember === "enabled";

  if (
    email.includes("@") &&
    email.includes(".") &&
    password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
  ) {
    const user = await db.collection("users").findOne({
      email: email,
      password: password,
    });

    if (user) {
      const cookieOptions = {
        httpOnly: true,
        ...(rememberMe && { maxAge: 7 * 24 * 60 * 60 * 1000 }),
      };

      res.cookie("userId", user._id.toString(), cookieOptions);
      res.cookie("userEmail", user.email, cookieOptions);

      console.log("Zalogowano:", user.email);
      res.redirect("/events");
    } else {
      res.render("error-login");
    }
  } else {
    res.render("error", { error_message: "Złe wartości w polach" });
  }
});

export default router;
