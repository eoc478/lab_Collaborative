const socket = io("https://lab-collaborative.onrender.com"); //"https://lab-collaborative.onrender.com" use this when deploying on Render
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


canvas.width = 600;
canvas.height = 400;

ctx.strokeStyle = "#302f2fea";
ctx.lineWidth = 2;
ctx.lineCap = "round";

let cursorX = 300;
let cursorY = 200;
const moveAmount = 5; //pixel amount when moving

let playerNumber = null;

let totalClicks = 0;
let shake = false;
const shakeBtn = document.getElementById("btn");

let whichPlayer = document.getElementById("whichPlayer");
let directions = document.getElementById("directions");
let splashP = document.getElementById("splashP");

socket.on("playerAssignment", (data) => {
    playerNumber = data.playerNumber;
    console.log(`You are Player ${playerNumber}`);
    
    if (playerNumber === 1) {
        console.log("player 1 LEFT AND RIGHT");
        whichPlayer.textContent = `You are Player ${playerNumber}`
        directions.textContent = `Use the LEFT and RIGHT arrow keys to draw`
    } else {
        console.log("player 2 UP AND DOWN");
        whichPlayer.textContent = `You are Player ${playerNumber}`
        directions.textContent = `Use the UP and DOWN arrow keys to draw`
    }
});

socket.on("playerCount", (count) => {
    console.log(`Total players connected: ${count}`);
    if (count === 2 ){
        console.log("max players");
        splashP.textContent = "players found! click anywhere to continue"
    } else{
        splashP.textContent = "waiting for players..."
    }
});


document.addEventListener("keydown", (e) => {
    if(playerNumber === null) return;

    //only listens to arrow keys
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        return;
    }
    
    e.preventDefault(); // prevent page from scrolling
    
    // storing old position
    const oldX = cursorX;
    const oldY = cursorY;
    
    // Update cursor position based on which arrow key was pressed
    if (playerNumber === 1 && e.key === "ArrowLeft") {
        cursorX = Math.max(0, cursorX - moveAmount); // Don't go past left edge
    } else if (playerNumber === 1 && e.key === "ArrowRight") {
        cursorX = Math.min(canvas.width, cursorX + moveAmount); // Don't go past right edge
    } else if (playerNumber === 2 && e.key === "ArrowUp") {
        cursorY = Math.max(0, cursorY - moveAmount); // Don't go past top edge
    } else if (playerNumber === 2 && e.key === "ArrowDown") {
        cursorY = Math.min(canvas.height, cursorY + moveAmount); // Don't go past bottom edge
    }
    
    // Draw a line from old position to new position
    drawLine(oldX, oldY, cursorX, cursorY, true);
});

// Draw line on canvas
function drawLine(x1, y1, x2, y2, emit) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Send drawing data to server so other players can see it
    if (emit) {
        socket.emit("draw", { x1, y1, x2, y2 });
    }
}

// Receive drawing data from other players
socket.on("draw", ({ x1, y1, x2, y2 }) => {
    drawLine(x1, y1, x2, y2, false);
    cursorX = x2;
    cursorY = y2;
});

shakeBtn.addEventListener("click", () => {
    socket.emit("clear");
});

socket.on("shakeClear", () => {
    const container = document.querySelector(".container");
    
    container.classList.add("shaking");
    
    const totalDuration = 3000; 
    const fadeSteps = 30; // how many steps it takes to fade away
    const intervalTime = totalDuration / fadeSteps; // 50ms per step
    
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        
        // Paint a semi-transparent white rectangle to gradually fade the drawing
        ctx.fillStyle = `rgba(224, 212, 215, ${1 / fadeSteps})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // When we've completed all fade steps
        if (currentStep >= fadeSteps) {
            clearInterval(fadeInterval);
            //clear the rectangle
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cursorX = 300;
            cursorY = 200;
        }
    }, intervalTime); // Run every 50ms
    
    // Remove shake animation after 3 seconds (same as fade duration)
    setTimeout(() => {
        container.classList.remove("shaking");
    }, totalDuration);
});