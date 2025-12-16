import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  console.log("login");
  res.render("login");
});

export default router;
