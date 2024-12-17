const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("createCircle");
const fileInput = document.getElementById("fileInput");

let backgroundImage = null; // To store uploaded image
let offsetX, offsetY; // Offsets for dragging circles

/**
 * Circle Class with properties and methods
 */
class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.moonRadius = 5;
    this.orbitRadius = this.radius + 10;
    this.angle = Math.random() * Math.PI * 2;
    this.orbitSpeed = 0.02;
  }

  /**
   * Draw circle with gradient
   */
  draw() {
    const gradient = ctx.createRadialGradient(
      this.x - this.radius / 3, this.y - this.radius / 3, 0,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, "black");

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    this.updateMoonPosition();
  }
  updateMoonPosition() {
    this.angle += this.orbitSpeed;
    const moonX = this.x + Math.cos(this.angle) * this.orbitRadius;
    const moonY = this.y + Math.sin(this.angle) * this.orbitRadius;

    ctx.beginPath();
    ctx.arc(moonX, moonY, this.moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }

  /**
   * Check if a point is inside this circle
   */
  containsPoint(mouseX, mouseY) {
    return Math.sqrt((this.x - mouseX) ** 2 + (this.y - mouseY) ** 2) <= this.radius;
  }
}

/**
 * CircleFunction Class to manage circle objects
 */
class CircleFunction {
  constructor() {
    this.circle_set = new Set();
  }

  addCircle(circle) {
    this.circle_set.add(circle);
  }

  drawCircles() {
    this.circle_set.forEach(circle => circle.draw());
  }

  getCircleAtPoint(mouseX, mouseY) {
    for (const circle of this.circle_set) {
      if (circle.containsPoint(mouseX, mouseY)) return circle;
    }
    return null;
  }
}

const circleFunObj = new CircleFunction();
let draggingCircle = null; // Currently selected circle

/**
 * File Input: Upload and load background image
 */
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => backgroundImage = img;
});

/**
 * Button: Add Random Circle
 */
button.addEventListener("click", () => {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const radius = Math.random() * 20 + 10;
  const color = `hsl(${Math.random() * 360}, 70%, 50%)`;

  const newCircle = new Circle(x, y, radius, color);
  circleFunObj.addCircle(newCircle);
});

/**
 * Mouse Events: Dragging Functionality
 */
canvas.addEventListener("mousedown", (e) => {
  const mouseX = e.offsetX;
  const mouseY = e.offsetY;

  const circle = circleFunObj.getCircleAtPoint(mouseX, mouseY);
  if (circle) {
    draggingCircle = circle;
    offsetX = mouseX - circle.x;
    offsetY = mouseY - circle.y;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (draggingCircle) {
    draggingCircle.x = e.offsetX - offsetX;
    draggingCircle.y = e.offsetY - offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  draggingCircle = null;
});

/**
 * Animation Loop
 */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image if uploaded
  if (backgroundImage) {
    const aspectRatio = backgroundImage.width / backgroundImage.height;
    let newWidth = canvas.width;
    let newHeight = canvas.width / aspectRatio;

    if (newHeight > canvas.height) {
      newHeight = canvas.height;
      newWidth = canvas.height * aspectRatio;
    }

    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    ctx.drawImage(backgroundImage, offsetX, offsetY, newWidth, newHeight);
  }

  // Draw all circles
  circleFunObj.drawCircles();

  requestAnimationFrame(animate);
}

// Start animation
animate();