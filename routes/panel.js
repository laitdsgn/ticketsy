import express from "express";
import fs from "fs";
import path from "path";
import connect from "../public/mongoconnect.js";
import { db } from "../public/mongoconnect.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connect();
    const userIdValue = req.cookies["userId"];

    if (!userIdValue) {
      return res.render("error", { error_message: "Nie jesteś zalogowany" });
    }

    const tickets = await db
      .collection("tickets")
      .aggregate([
        { $match: { userId: new ObjectId(userIdValue) } },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },
        { $unwind: "$event" },
      ])
      .toArray();

    const ticketsWithPdf = tickets.map((ticket) => {
      const pdfFileName = `${userIdValue}_${ticket.seatNumber}.pdf`;
      const pdfPath = path.join("public", "tickets", pdfFileName);
      const pdfExists = fs.existsSync(pdfPath);

      return {
        ...ticket,
        pdfFileName,
        pdfExists,
      };
    });

    res.render("panel", { tickets: ticketsWithPdf });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err);
  }
});

router.get("/download/:filename", async (req, res) => {
  try {
    const userIdValue = req.cookies["userId"];

    if (!userIdValue) {
      return res
        .status(401)
        .render("error", { error_message: "Nie jesteś zalogowany" });
    }

    const { filename } = req.params;

    if (!filename.startsWith(userIdValue)) {
      return res
        .status(403)
        .render("error", { error_message: "Brak dostępu do tego biletu" });
    }

    const pdfPath = path.join("public", "tickets", filename);

    if (!fs.existsSync(pdfPath)) {
      return res
        .status(404)
        .render("error", { error_message: "Bilet nie został znaleziony" });
    }

    res.download(pdfPath, filename);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err);
  }
});

export default router;
