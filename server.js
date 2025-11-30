import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

// Use the port Render provides, or default to 3000 for local dev
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Enable CORS so your GH Pages or React app can connect
const io = new Server(server, {
  cors: {
    origin: "*",             // you can restrict this later
    methods: ["GET", "POST"]
  }
});

app.use(express.static("docs")); //tells our server to use the public folder to serve our files (index.html, style.css, script.js);

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);
    
    //notice a draw input on our client, then broadcast message to everyone else connected that there is a "draw" signal and pass the data
    socket.on("draw", (data) => {
        socket.broadcast.emit("draw", data);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected UPDATE: " + socket.id);
    })
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});