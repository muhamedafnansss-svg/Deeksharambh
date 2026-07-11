export class ParticleEngine {
  constructor(canvas, dpr) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = dpr;
    this.particles = [];
    this.initDust(300); // Create 300 golden dust particles
  }

  resize(dpr) {
    this.dpr = dpr;
  }

  initDust(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.2, // Very slow drift
        vy: (Math.random() - 0.5) * 0.2 - 0.1, // Slight upward drift
        radius: (Math.random() * 1.5 + 0.5) * this.dpr,
        alpha: Math.random(),
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  update(dt, currentTime) {
    for (let p of this.particles) {
      p.x += p.vx * dt * 60; // Normalize by 60fps
      p.y += p.vy * dt * 60;
      p.alpha += Math.sin(currentTime * p.pulseSpeed) * 0.01;
      
      // Keep alpha in bounds
      if (p.alpha < 0.1) p.alpha = 0.1;
      if (p.alpha > 0.8) p.alpha = 0.8;

      // Wrap around edges
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
    }
  }

  draw() {
    this.ctx.save();
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`; // Royal Gold with alpha
      
      // Soft glow for each particle
      this.ctx.shadowColor = '#F3C623';
      this.ctx.shadowBlur = 5 * this.dpr;
      
      this.ctx.fill();
    }
    this.ctx.restore();
  }
}
