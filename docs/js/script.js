const socket = io("https://lab-collaborative.onrender.com"); //create instance of websocket
const canvas = document.getElementById("canvas"); //store the canvas element
const ctx = canvas.getContext("2d"); //instance of the canvas and set it to 2D dimensions

let drawing = false;
let lastX, lastY;
let p1;
let p2;

//when the user is clicking, they are drawing
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY]; //take last X point and create a new offset
});

canvas.addEventListener("mouseup", () => (drawing = false)); 

//if the user is clicking down on the mouse, use the drawLine feature between last point and current point
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const [x, y] = [e.offsetX, e.offsetY];
  drawLine(lastX, lastY, x, y, true);
  [lastX, lastY] = [x, y];
});

//canvas methods
function drawLine(x1, y1, x2, y2, emit) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  //socket emits our draing data as a JSON object, sending out a signal that someone is drawing and send the data on all the lines drawn
  if (emit) socket.emit("draw", { x1, y1, x2, y2 });
}

//when socket receives "draw" event, it passes the JSON data to our drawLine function
socket.on("draw", ({ x1, y1, x2, y2 }) => drawLine(x1, y1, x2, y2, false));

// const clearButton = document.getElementById("clear");
// clearButton.addEventListener("click", () => {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   socket.emit("clear");
// });

socket.on("clear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

