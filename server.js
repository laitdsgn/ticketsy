import express from "express";
import loginRoutes from "./routes/login.js";
import registerRoutes from "./routes/register.js";
import eventsRoutes from "./routes/events.js";

const app = express();

app.use(express.static("public"));
app.use("/styles", express.static("styles"));

app.set("view engine", "pug");
app.set("views", "./views");
app.get("/", (req, res) => {
  res.render("structure", { user: "xyz" });
});

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/events", eventsRoutes);

app.listen(3000);
