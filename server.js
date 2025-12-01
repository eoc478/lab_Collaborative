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
}); // bring this back for Render

app.use(express.static("docs")); //tells our server to use the public folder to serve our files (index.html, style.css, script.js);


//-------------------------------socket stuff--------------------------------------
let players = [];

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    let playerNumber;
        if (players.length === 0) {
        playerNumber = 1;
        players.push({ id: socket.id, number: 1 });
        console.log("Player 1 joined");
    } else if (players.length === 1) {
        playerNumber = 2;
        players.push({ id: socket.id, number: 2 });
        console.log("Player 2 joined");
    } else {
        // Game is full
        console.log("Game full - rejecting connection");
        socket.emit("gameFull");
        socket.disconnect();
        return;
    }

    // Send player number to the client
    socket.emit("playerAssignment", { playerNumber });
    
    // tell clients about player count
    io.emit("playerCount", players.length);
    
    //notice a draw input on our client, then broadcast message to everyone else connected that there is a "draw" signal and pass the data
    socket.on("draw", (data) => {
        socket.broadcast.emit("draw", data);
    })

      socket.on("clear", () => {
        console.log(`Player ${playerNumber} clicked shake button`);
        // Tell ALL players (including the one who clicked) to shake and clear
        io.emit("shakeClear");
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
        
        players = players.filter(player => player.id !== socket.id);
        console.log(`Players remaining: ${players.length}`);
        // Notify remaining clients
        io.emit("playerCount", players.length);
    })
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});