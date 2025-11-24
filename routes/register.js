import express from "express";

const router = express.Router();
const app = express();
app.set("view engine", "pug");
app.set("views", "../views/");

router.get("/", (req, res) => {
  res.render("register");
  console.log("Register");
});

export default router;
