import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  console.log("cms");
  res.render("cms");
});

export default router;
