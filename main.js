"use strict";

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speedSlider");
const attractToggle = document.getElementById("attractToggle");

const config = {
  count: 150,
  baseSpeed: 0.5,
  attraction: 0.035,
  wander: 0.5,
  dispersePull: 0.03,
};

let isInteractionEnabled = false;
let speedMultiplier = speedSlider ? parseFloat(speedSlider.value) || 1 : 1;
let dispersing = false;

const cursor = { x: 0, y: 0, active: false };
const particles = [];

attractToggle.addEventListener("change", function (e) {
  isInteractionEnabled = this.checked;

  if (!isInteractionEnabled) {
    cursor.active = false;
  }
});

function resizeCanvas() {
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;

  // 更清晰
  const dpr = window.devicePixelRatio || 1;
  const { innerWidth: w, innerHeight: h } = window;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * config.baseSpeed;
    this.vy = Math.sin(angle) * config.baseSpeed;
    this.size = 5 + Math.random() * 4.5;
    this.target = null;
  }

  setDisperseTarget() {
    this.target = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    };
  }

  update() {
    if (cursor.active) {
      const dx = cursor.x - this.x;
      const dy = cursor.y - this.y;
      const dist = Math.hypot(dx, dy) + 0.001;
      const strength = config.attraction * speedMultiplier;
      this.vx += (dx / dist) * strength;
      this.vy += (dy / dist) * strength;
      this.target = null;
    } else if (dispersing) {
      if (!this.target) this.setDisperseTarget();
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy) + 0.001;
      const pull = config.dispersePull * speedMultiplier;
      this.vx += (dx / dist) * pull;
      this.vy += (dy / dist) * pull;
      if (dist < 6) this.target = null;
    } else {
      this.vx += (Math.random() - 0.5) * config.wander;
      this.vy += (Math.random() - 0.5) * config.wander;
    }

    // Gentle damping prevents runaway velocities
    this.vx *= 0.985;
    this.vy *= 0.985;

    this.x += this.vx * speedMultiplier;
    this.y += this.vy * speedMultiplier;

    // Wrap slightly offscreen to avoid abrupt edges
    if (this.x < -40) this.x = canvas.width + 40;
    if (this.x > canvas.width + 40) this.x = -40;
    if (this.y < -40) this.y = canvas.height + 40;
    if (this.y > canvas.height + 40) this.y = -40;
  }

  draw() {
    ctx.beginPath();

    ctx.fillStyle = "rgba(70, 255, 143, 0.85)";

    ctx.shadowBlur = 42;
    ctx.shadowColor = "#46ff8f";
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function seedParticles() {
  particles.length = 0;
  for (let i = 0; i < config.count; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animate);
}

// 当光标进入canvas和光标移动时调用
const activateCursor = (event) => {
  if (isInteractionEnabled == true) {
    // 获取当前光标的坐标
    cursor.x = event.clientX;
    cursor.y = event.clientY;

    cursor.active = true;
    dispersing = false;
  }
};

canvas.addEventListener("mousemove", activateCursor);
canvas.addEventListener("mouseenter", activateCursor);

canvas.addEventListener("mouseleave", () => {
  cursor.active = false;
  // dispersing = true;
  // particles.forEach((particle) => particle.setDisperseTarget());
});

speedSlider.addEventListener("input", (event) => {
  speedMultiplier = parseFloat(event.target.value);
});

seedParticles();
animate();
