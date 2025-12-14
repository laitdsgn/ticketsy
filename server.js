import express from "express";
import loginRoutes from "./routes/login.js";
import registerRoutes from "./routes/register.js";
import eventsRoutes from "./routes/events.js";
import cmsRoutes from "./routes/cms.js";

const app = express();

app.use(express.static("public"));
app.use("/styles", express.static("styles"));

app.set("view engine", "pug");
app.set("views", "./views");
app.get("/", (req, res) => {
  res.render("home");
});

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/events", eventsRoutes);
app.use("/admin-panel", cmsRoutes);

app.listen(3000);
