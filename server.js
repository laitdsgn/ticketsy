import express from "express";
import cookieParser from "cookie-parser";
import loginRoutes from "./routes/login.js";
import registerRoutes from "./routes/register.js";
import eventsRoutes from "./routes/events.js";
import cmsRoutes from "./routes/cms.js";
import panelRoutes from "./routes/panel.js";
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
app.use("/panel", panelRoutes);

async function expireReservationsOnce() {
  try {
    const now = new Date();
    const result = await db
      .collection("reservations")
      .updateMany(
        { status: "active", expiresAt: { $lte: now } },
        { $set: { status: "expired" } },
      );
    if (result.modifiedCount > 0) {
      console.log(`Expired reservations updated: ${result.modifiedCount}`);
    }
  } catch (err) {
    console.error("Failed to expire reservations:", err);
  }
}

(async () => {
  try {
    await db
      .collection("reservations")
      .createIndex({ status: 1, expiresAt: 1 });
    await db
      .collection("reservations")
      .createIndex({ eventId: 1, seatNumber: 1 });
  } catch (err) {
    console.error("Failed to create reservation indexes:", err);
  }
})();

setInterval(expireReservationsOnce, 30_000);
expireReservationsOnce();

app.listen(3000);
