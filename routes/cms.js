import express from "express";
import connect from "../public/mongoconnect.js";
import { db } from "../public/mongoconnect.js";
import { MongoClient, ObjectId } from "mongodb";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

// Admin middleware to check user role
const adminOnly = async (req, res, next) => {
  const userIdValue = req.cookies["userId"];

  if (!userIdValue) {
    return res.render("error", { error_message: "Nie jesteś zalogowany" });
  }

  try {
    await connect();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(userIdValue),
    });

    if (!user || user.role !== "admin") {
      return res.render("error", {
        error_message: "Brak dostępu. Wymagane uprawnienia administratora",
      });
    }

    next();
  } catch (err) {
    return res.status(500).send("Server error: " + err);
  }
};

router.get("/", adminOnly, (req, res) => {
  connect();
  console.log("cms");
  res.render("cms");
});

router.post("/", adminOnly, upload.single("thumbnail"), async (req, res) => {
  const { title, description, data, location, price, totalSeats } = req.body;
  try {
    let thumbnailPath = "";
    if (req.file) {
      thumbnailPath = "/uploads/" + req.file.filename;
    }

    await db.collection("events").insertOne({
      title,
      description,
      date: data ? new Date(data) : null,
      location,
      price: Number(price) || 0,
      totalSeats: Number(totalSeats) || 0,
      occupiedSeats: [],
      thumbnail: thumbnailPath,
      createdAt: new Date(),
    });
    res.redirect("/admin-panel");
  } catch (error) {
    console.error(error);
    res.status(500).send("Błąd podczas dodawania eventu");
  }
});

export default router;
