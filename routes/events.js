import express from "express";
import connect from "../public/mongoconnect.js";
import { db } from "../public/mongoconnect.js";
import { MongoClient, ObjectId } from "mongodb";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connect();
    const userIdValue = req.cookies["userId"];
    if (userIdValue) {
      res.render("events");
      console.log("events");
    } else {
      res.render("error", { error_message: "Nie jesteś zalogowany" });
    }
  } catch (err) {
    res.status(500).send("Server error" + err);
  }
});

router.post("/ticket", async (req, res) => {
  try {
    await connect();
    const { id, seat, imie, nazwisko, wiek } = req.body;
    const userIdValue = req.cookies["userId"];
    if (
      id &&
      id.trim() !== "" &&
      seat.trim() !== "" &&
      imie.trim() !== "" &&
      nazwisko.trim() !== "" &&
      wiek.trim() !== "" &&
      parseInt(wiek) >= 18 &&
      userIdValue
    ) {
      const eventObjectId = new ObjectId(id);
      const eventDoc = await db
        .collection("events")
        .findOne({ _id: eventObjectId });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 5);
      const isReservationOnSeat = await db
        .collection("reservations")
        .findOne({ seatNumber: Number(seat), status: "active" });
      const isBoughtOnSeat = await db
        .collection("tickets")
        .findOne({ seatNumber: Number(seat) });
      let reservationId = null;
      if (!isReservationOnSeat && !isBoughtOnSeat) {
        const insertResult = await db.collection("reservations").insertOne({
          _id: new ObjectId(),
          userId: new ObjectId(userIdValue),
          eventId: eventObjectId,
          seatNumber: Number(seat),
          expiresAt,
          status: "active",
          createdAt: new Date(),
        });
        reservationId = insertResult.insertedId;
      } else {
        return res.render("error-reservation");
      }
      console.log("gate");
      return res.render("gate", {
        eventId: id,
        reservationId: reservationId?.toString() || "",
        eventTitle: eventDoc?.title || "",
        eventDate: eventDoc?.date || null,
        eventLocation: eventDoc?.location || "",
        eventPrice: eventDoc?.price ?? null,
        seatNumber: Number(seat),
        firstName: imie,
        lastName: nazwisko,
        age: Number(wiek),
        expiresAt,
      });
    } else {
      return res.render("error");
    }
  } catch (err) {
    return res.status(500).send("Server error" + err);
  }
});

router.post("/gate/bought", async (req, res) => {
  try {
    await connect();
    const { reservationId } = req.body;
    const userIdValue = req.cookies["userId"];

    if (!reservationId || !userIdValue) {
      return res.status(400).render("error", "nie mieszaj w wartościach ID!");
    }

    await db.collection("reservations").updateOne(
      {
        _id: new ObjectId(reservationId),
        userId: new ObjectId(userIdValue),
        status: "active",
      },
      { $set: { status: "expired" } }
    );

    const targetReservation = await db.collection("reservations").findOne({
      _id: new ObjectId(reservationId),
      userId: new ObjectId(userIdValue),
    });

    const isReservationOnSeat = await db.collection("reservations").findOne({
      seatNumber: Number(targetReservation.seatNumber),
      status: "active",
    });
    const isBoughtOnSeat = await db
      .collection("tickets")
      .findOne({ seatNumber: Number(targetReservation.seatNumber) });

    if (!isReservationOnSeat && !isBoughtOnSeat) {
      await db.collection("tickets").insertOne({
        _id: new ObjectId(),
        userId: new ObjectId(userIdValue),
        eventId: new ObjectId(targetReservation.eventId),
        seatNumber: Number(targetReservation.seatNumber),
        boughtAt: new Date(),
      });
    }

    return res.redirect("/events/transaction-accepted");
  } catch (err) {
    return res.status(500).send("Server error" + err);
  }
});

router.get("/transaction-accepted", async (req, res) => {
  try {
    await connect();
    return res.render("transaction-accepted");
  } catch (err) {
    return res.status(500).send("Server error" + err);
  }
});

router.get("/get-events", async (req, res) => {
  try {
    const events = await db.collection("events").find({}).toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch events" });
  }
});

export default router;
