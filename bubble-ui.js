const canvas = document.getElementById("webgl-container");
const gl = canvas.getContext("webgl");

if (!gl) {
  console.error("WebGL not supported");
}

// Initialize WebGL viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

gl.clearColor(0.9, 0.9, 0.9, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Bubble data
const bubbles = [];
const numBubbles = 50;
const maxSize = 50;
const minSize = 10;

for (let i = 0; i < numBubbles; i++) {
  bubbles.push({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    size: Math.random() * (maxSize - minSize) + minSize,
  });
}

// Render loop
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  bubbles.forEach((bubble) => {
    drawBubble(bubble);
  });

  requestAnimationFrame(render);
}

function drawBubble(bubble) {
  const x = bubble.x;
  const y = bubble.y;
  const size = bubble.size / canvas.width;

  // Placeholder for drawing logic
  console.log(`Drawing bubble at (${x}, ${y}) with size ${size}`);
}

render();