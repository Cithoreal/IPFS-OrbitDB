
import net from "net";

const port = 5000;

const server = net.createServer((socket) => {
    console.log("Client connected");

    socket.on("data", (data) => {

        console.log(`Received: ${data}`);

        var result = "Hey you"

        socket.write(result.toString());
    });

    socket.on("end", () => {
        console.log("Client disconnected");
    });

    socket.on("error", (error) => {
        console.log(`Socket Error: ${error.message}`);
    });
});

server.on("error", (error) => {
    console.log(`Server Error: ${error.message}`);
});

server.listen(port, () => {
    console.log(`TCP socket server is running on port: ${port}`);
});