import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("events page");
  console.log("events");
});

export default router;
