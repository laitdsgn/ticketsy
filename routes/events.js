import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("events");
  console.log("events");
});

export default router;
