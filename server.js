import express from "express";
import cookieParser from "cookie-parser";
import loginRoutes from "./routes/login.js";
import registerRoutes from "./routes/register.js";
import eventsRoutes from "./routes/events.js";
import cmsRoutes from "./routes/cms.js";
import { db } from "./public/mongoconnect.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.cookies.userId;
  res.locals.userEmail = req.cookies.userEmail || null;
  next();
});

app.use(express.static("public"));
app.use("/styles", express.static("styles"));

app.set("view engine", "pug");
app.set("views", "./views");
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/logout", (req, res) => {
  res.clearCookie("userId");
  res.clearCookie("userEmail");
  res.redirect("/");
});

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/events", eventsRoutes);
app.use("/admin-panel", cmsRoutes);

app.listen(3000);
