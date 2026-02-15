import express from "express";
import fs from "fs";
import connect from "../public/mongoconnect.js";
import { db } from "../public/mongoconnect.js";
import { ObjectId } from "mongodb";
import PDFDocument from "pdfkit";
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
      return res
        .status(400)
        .render("error", { error_message: "Nie mieszaj w wartościach ID!" });
    }

    await db.collection("reservations").updateOne(
      {
        _id: new ObjectId(reservationId),
        userId: new ObjectId(userIdValue),
        status: "active",
      },
      { $set: { status: "expired" } },
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

    const EventInfo = await db.collection("events").findOne(
      { _id: new ObjectId(targetReservation.eventId) },
      {
        projection: {
          thumbnail: 1,
          title: 1,
          description: 1,
          location: 1,
          _id: 0,
        },
      },
    );

    const ticketPDF = new PDFDocument();
    const ticketPath = `public/tickets/${userIdValue}_${targetReservation.seatNumber}.pdf`;
    const writeStream = fs.createWriteStream(ticketPath);

    ticketPDF.pipe(writeStream);

    ticketPDF
      .rect(0, 0, ticketPDF.page.width, ticketPDF.page.height)
      .fill("#f5f5f5");

    if (EventInfo?.thumbnail) {
      ticketPDF.image("public" + EventInfo.thumbnail, 50, 30, {
        fit: [150, 150],
        align: "center",
      });
    }

    ticketPDF
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("black")
      .text(EventInfo?.title || "Event Ticket", 220, 40, { width: 300 });

    ticketPDF
      .font("Helvetica")
      .fontSize(12)
      .fillColor("black")
      .text("Lokalizacja: " + (EventInfo?.location || "N/A"), 220, 110, {
        width: 300,
      });

    ticketPDF
      .fontSize(10)
      .fillColor("black")
      .text("Opis: " + (EventInfo?.description || "N/A"), 220, 135, {
        width: 300,
        height: 80,
        ellipsis: true,
      });

    ticketPDF
      .strokeColor("#333")
      .lineWidth(1)
      .moveTo(40, 250)
      .lineTo(560, 250)
      .stroke();

    ticketPDF
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#000000")
      .text("DETALE", 50, 270);

    ticketPDF
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#000000")
      .text("Siedzenie: " + targetReservation.seatNumber, 50, 300);

    ticketPDF
      .fillColor("#000000")
      .text("Bilet: " + reservationId?.toString().slice(0, 8) || "", 50, 325);

    ticketPDF
      .fillColor("#000000")
      .text("Uzytkownik: " + userIdValue.slice(0, 8) || "", 50, 350);

    ticketPDF
      .fillColor("#000000")
      .text("Data: " + new Date().toLocaleDateString("pl-PL"), 50, 375);

    ticketPDF.fontSize(10).fillColor("#000000").text("BARCODE", 50, 420);

    const barcodeData = (reservationId?.toString() || "").substring(0, 12);
    let xPos = 50;
    for (let i = 0; i < barcodeData.length; i++) {
      const charCode = barcodeData.charCodeAt(i);
      const barWidth = (charCode % 3) + 1;
      const barHeight = (charCode % 5) + 15;
      ticketPDF
        .fillColor("#000000")
        .rect(xPos, 445, barWidth * 2, barHeight)
        .fill();
      xPos += barWidth * 2 + 2;
    }

    ticketPDF.fontSize(9).fillColor("#000000").text(barcodeData, 50, 470);

    ticketPDF.end();

    writeStream.on("finish", () => {
      return res.redirect("/events/transaction-accepted");
    });
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
