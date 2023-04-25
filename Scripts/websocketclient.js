//const net = require("net");
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