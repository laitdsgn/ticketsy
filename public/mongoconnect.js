import { MongoClient } from "mongodb";

const CONNECTION_STRING = "mongodb://localhost:27017/";

let db;
let client;
async function connect() {
  try {
    client = new MongoClient(CONNECTION_STRING);
    db = client.db("ticketsy");

    await client.connect();
    console.log("connected");
  } catch (err) {
    console.log(err);
  }
}

connect();
export { db, client };
export default connect;
