import IPFSOrbitDB from "./IPFSOrbitDB.js";
import net from "net";
const host = "127.0.0.1";
const port = 5000;

const client = net.createConnection(port, host, () => {
    console.log("Connected");
    client.write("Hey pretty kitty :3");
});

client.on("data", (data) => {
    console.log(`Received: ${data}`);
});

client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});

client.on("close", () => {
    console.log("Connection closed");
});
const ipfsOrbitDB = new IPFSOrbitDB();
//ipfsOrbitDB.create();
//ipfsOrbitDB.onready = async () => {

 // await ipfsOrbitDB.connectToPeer("12D3KooWNqHZYdfz6iNn8Cmk5nnMckzvTUuJW98VVXbGrMwVjucj", "/ip4/192.168.1.28/tcp/4002/p2p/");
  //ipfsOrbitDB.ondbdiscovered = (db) => console.log(db.all);

  //ipfsOrbitDB.onpeeronline = console.log;
  //this.onpeernotfound = (e) => {
  //  throw e;
  //};
  //ipfsOrbitDB.sendMessage("hi")
  //ipfsOrbitDB.queryCatalog();
//};
