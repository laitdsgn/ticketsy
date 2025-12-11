import express from "express";

const router = express.Router();
const app = express();
app.set("view engine", "pug");
app.set("views", "../views/");

router.get("/", (req, res) => {
  console.log("cms");
  res.render("cms");
});

export default router;
