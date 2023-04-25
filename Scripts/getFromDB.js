import net from "net";
const host = "127.0.0.1";
const port = 5000;

const client = net.createConnection(port, host, () => {
  console.log("Connected");
    var arr = process.argv.slice(1)
    arr[0] = "get"
    console.log(arr.toString())
    client.write(arr.toString());
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