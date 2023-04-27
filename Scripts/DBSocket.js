import net from "net";
const host = "127.0.0.1";
const port = 5000;

const client = net.createConnection(port, host, () => {
    var arr = process.argv.slice(2)
    client.write(arr.toString());
});

client.on("data", (data) => {
    console.log(data.toString());
    client.end();
});

client.on("error", (error) => {
    console.log(`Error: ${error.message}`);
});
