import { ParticleEngine } from './ParticleEngine';

export class TreeEngine {
  constructor(canvas, dpr) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = dpr;
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.isRunning = false;
    this.lastTime = 0;
    
    this.stage = 0;
    this.globalTime = 0;
    this.stageTimes = {}; 

    this.groundY = this.height * 0.85;
    this.mainRoot = null;
    this.trunk = null;
    
    this.particles = new ParticleEngine(canvas, dpr);
    this.camera = { x: 0, y: 0, zoom: 1 };
    
    this.generateTree();
  }

  resize(width, height, dpr) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.groundY = this.height * 0.85;
    this.particles.resize(dpr);
    this.generateTree();
  }

  setStage(stage) {
    if (this.stage === stage) return;
    this.stage = stage;
    this.stageTimes[stage] = 0; 
  }

  generateTree() {
    const startX = this.width / 2;
    const startY = this.groundY;
    
    // Base scale on the smaller dimension to prevent clipping on mobile portrait
    const baseScale = Math.min(this.width, this.height);
    
    // 1 Main Root growing down
    this.mainRoot = this.createBranch(startX, startY, Math.PI / 2, baseScale * 0.15, 14, 0, 4, true, 4);

    // 1 Main Trunk growing up
    this.trunk = this.createBranch(startX, startY, -Math.PI / 2, baseScale * 0.28, 18, 0, 6, false, 4);
    
    // Map the 8 words (Stages 5 to 12) to 8 major branch clusters in the canopy
    let leafClusters = [];
    const collectLeafClusters = (branch) => {
      // Find mid-level branches to act as cluster roots
      if (branch.depth === 2 && branch.children.length > 0) {
        leafClusters.push(branch);
      } else {
        for (let c of branch.children) collectLeafClusters(c);
      }
    };

    if (this.trunk) {
      collectLeafClusters(this.trunk);
      
      // Sort clusters roughly from left to right or by angle to map to words nicely
      leafClusters.sort((a, b) => a.endX - b.endX);
      
      // We want to map exactly 7 stages (5 through 11). If there are more/less clusters, we map them evenly
      for (let i = 0; i < leafClusters.length; i++) {
         const stageIndex = 5 + (i % 7);
         
         // Recursively apply this leafTriggerStage to all sub-branches and leaves in this cluster
         const setLeafTrigger = (b, trigger) => {
            b.leafTriggerStage = trigger;
            for (let leaf of b.leaves) leaf.triggerStage = trigger;
            for (let child of b.children) setLeafTrigger(child, trigger);
         };
         setLeafTrigger(leafClusters[i], stageIndex);
      }
    }
  }

  createBranch(startX, startY, angle, length, width, depth, maxDepth, isRoot, branchTriggerStage) {
    if (depth > maxDepth) return null;

    // Use graceful curves for a highly professional, elegant look
    let curveStrength = isRoot ? 0.3 : 0.4;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * length * curveStrength;
    const cpY = (startY + endY) / 2 + (Math.random() - 0.5) * length * curveStrength;

    const branch = {
      startX, startY, cpX, cpY, endX, endY, width, depth, isRoot,
      branchTriggerStage, // Stage 4: Skeletal tree grows
      leafTriggerStage: 15, // Assigned during generateTree for leaves
      children: [],
      leaves: [],
      delay: depth * 0.5 + Math.random() * 0.2 // Procedural growth staggering
    };

    // Attach Leaves
    if (!isRoot && depth >= maxDepth - 2) {
      const numLeaves = depth === maxDepth ? 8 : 4;
      for (let i = 0; i < numLeaves; i++) {
        branch.leaves.push({
          x: endX + (Math.random() - 0.5) * 60 * this.dpr,
          y: endY + (Math.random() - 0.5) * 50 * this.dpr,
          size: (Math.random() * 5 + 3.5) * this.dpr,
          angle: Math.random() * Math.PI * 2,
          triggerStage: 15, 
          delay: Math.random() * 0.6 // Leaves pop sequentially
        });
      }
    }

    // Branching Logic
    if (depth < maxDepth) {
      let numChildren = 2;
      if (depth === 0) numChildren = 3; // Trunk splits into 3 main boughs
      else if (Math.random() > 0.8) numChildren = 3; // Occasional extra branch
      
      for (let i = 0; i < numChildren; i++) {
        let angleSpread = isRoot ? Math.PI / 3 : Math.PI / 2.5;
        let childAngle = angle + (i - (numChildren - 1) / 2) * angleSpread * (0.8 + Math.random() * 0.4);
        
        // Prevent branches from growing completely downwards
        if (!isRoot && childAngle > -0.1) childAngle = -0.1;
        if (!isRoot && childAngle < -Math.PI + 0.1) childAngle = -Math.PI + 0.1;

        const childLength = length * (0.65 + Math.random() * 0.15);
        const childWidth = width * 0.7;
        
        const child = this.createBranch(endX, endY, childAngle, childLength, childWidth, depth + 1, maxDepth, isRoot, branchTriggerStage);
        if (child) branch.children.push(child);
      }
    }

    return branch;
  }

  getStageTime(stage) {
    return this.stageTimes[stage] || 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  destroy() {
    this.isRunning = false;
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.update(dt);
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.globalTime += dt;
    this.particles.update(dt, this.globalTime);
    
    for (let i = 0; i <= this.stage; i++) {
       if (this.stageTimes[i] !== undefined) {
          this.stageTimes[i] += dt;
       }
    }
    
    if (this.stage >= 12) {
      this.camera.zoom = Math.max(this.camera.zoom - dt * 0.05, 0.6); // Zoom out more and faster
      this.camera.y = Math.min(this.camera.y + dt * 80 * this.dpr, this.height * 0.35); // Push tree much further down
    }
  }

  draw() {
    this.ctx.fillStyle = '#0a0a0a'; 
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.particles.draw();
    
    this.ctx.save();
    this.ctx.translate(this.width/2, this.height/2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.width/2, -this.height/2 + this.camera.y);

    if (this.stage >= 4) {
      const groundAlpha = Math.min(this.getStageTime(4) * 0.5, 1);
      this.ctx.beginPath();
      this.ctx.moveTo(-this.width, this.groundY);
      this.ctx.lineTo(this.width * 2, this.groundY);
      this.ctx.strokeStyle = `rgba(45, 28, 8, ${groundAlpha})`;
      this.ctx.lineWidth = 4 * this.dpr;
      this.ctx.stroke();
      
      this.ctx.shadowColor = '#F3C623';
      this.ctx.shadowBlur = 40 * this.dpr;
      this.ctx.strokeStyle = `rgba(212, 175, 55, ${groundAlpha * 0.2})`;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    if (this.stage >= 4) {
      if (this.mainRoot) this.drawBranch(this.mainRoot);
      if (this.trunk) {
         this.drawBranch(this.trunk);
         this.drawLeaves(this.trunk);
      }
    }

    this.ctx.restore();
  }

  drawBranch(branch) {
    if (this.stage < branch.branchTriggerStage) return;
    
    const timeInStage = this.getStageTime(branch.branchTriggerStage);
    let progress = timeInStage * 0.6 - branch.delay; // Branches grow beautifully over ~6-7s total
    
    if (progress <= 0) return;
    if (progress > 1) progress = 1;

    this.ctx.beginPath();
    this.ctx.moveTo(branch.startX, branch.startY);
    
    const t = progress;
    const invT = 1 - t;
    const pX = invT * invT * branch.startX + 2 * invT * t * branch.cpX + t * t * branch.endX;
    const pY = invT * invT * branch.startY + 2 * invT * t * branch.cpY + t * t * branch.endY;

    // Organic wind sway for thin canopy branches
    let windOffset = 0;
    if (!branch.isRoot && branch.depth > 2) {
      windOffset = Math.sin(this.globalTime * 1.5 + branch.endX * 0.01) * (branch.depth * 1.0 * this.dpr);
    }

    this.ctx.quadraticCurveTo(
      invT * branch.startX + t * branch.cpX + windOffset * 0.5, 
      invT * branch.startY + t * branch.cpY, 
      pX + windOffset, pY
    );

    if (branch.isRoot) {
      this.ctx.strokeStyle = '#8A6A1C'; 
    } else {
      this.ctx.strokeStyle = this.stage >= 12 ? '#F3C623' : '#D4AF37'; // Brighter gold in finale instead of laggy shadows
    }

    this.ctx.lineWidth = branch.width * this.dpr;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    if (progress >= 1) {
      for (const child of branch.children) {
        this.drawBranch(child);
      }
    }
  }

  drawLeaves(branch) {
    for (const leaf of branch.leaves) {
      if (this.stage < leaf.triggerStage) continue;
      
      const timeInStage = this.getStageTime(leaf.triggerStage);
      let progress = timeInStage * 1.2 - leaf.delay; // Pop leaves nicely
      
      if (progress > 0) {
        if (progress > 1) progress = 1;
        
        let windOffsetX = Math.sin(this.globalTime * 2 + leaf.x * 0.05) * 5 * this.dpr;
        let windOffsetY = Math.cos(this.globalTime * 1.5 + leaf.y * 0.05) * 3 * this.dpr;
        
        let finalY = leaf.y + windOffsetY;

        this.ctx.save();
        this.ctx.translate(leaf.x + windOffsetX, finalY);
        this.ctx.rotate(leaf.angle + Math.sin(this.globalTime * 3) * 0.2);
        
        // Satisfying Pop-in animation for leaves
        let scale = progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 0.2;
        if (progress >= 1) scale = 0.9;
        this.ctx.scale(scale, scale);
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, 0, 0, Math.PI * 2);
        
        if (this.stage >= 12) {
          this.ctx.fillStyle = '#F3C623'; // Bright gold in finale without laggy shadows
        } else {
          this.ctx.fillStyle = '#7FAE62'; 
        }
        this.ctx.fill();
        
        this.ctx.restore();
      }
    }

    for (const child of branch.children) {
      this.drawLeaves(child);
    }
  }
}
