"use client";

import * as React from "react";

export const RefractionVisual: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0, y: 0 });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Canvas refraction animation loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Prism center with subtle mouse parallax
      const prismCenterX = width * 0.42 + mousePos.x * 25;
      const prismCenterY = height * 0.5 + mousePos.y * 20;
      const prismSize = Math.min(width, height) * 0.32;

      // Prism triangle vertices
      const topVertex = { x: prismCenterX, y: prismCenterY - prismSize };
      const leftVertex = { x: prismCenterX - prismSize * 0.9, y: prismCenterY + prismSize * 0.8 };
      const rightVertex = { x: prismCenterX + prismSize * 0.9, y: prismCenterY + prismSize * 0.8 };

      // Incident ray from left (white/silver beam)
      const raySource = { x: 0, y: height * 0.55 + Math.sin(time) * 4 };
      const hitPoint = {
        x: (topVertex.x + leftVertex.x) * 0.5 + 10,
        y: (topVertex.y + leftVertex.y) * 0.5 + 20,
      };

      // Draw Incident White Beam with glow
      const incidentGrad = ctx.createLinearGradient(raySource.x, raySource.y, hitPoint.x, hitPoint.y);
      incidentGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
      incidentGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
      incidentGrad.addColorStop(1, "rgba(255, 255, 255, 0.95)");

      ctx.beginPath();
      ctx.moveTo(raySource.x, raySource.y);
      ctx.lineTo(hitPoint.x, hitPoint.y);
      ctx.strokeStyle = incidentGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Draw Glass Prism (Glassmorphism fill & stroke)
      ctx.beginPath();
      ctx.moveTo(topVertex.x, topVertex.y);
      ctx.lineTo(rightVertex.x, rightVertex.y);
      ctx.lineTo(leftVertex.x, leftVertex.y);
      ctx.closePath();

      const prismFill = ctx.createLinearGradient(
        leftVertex.x,
        topVertex.y,
        rightVertex.x,
        rightVertex.y
      );
      prismFill.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      prismFill.addColorStop(0.5, "rgba(34, 211, 238, 0.05)");
      prismFill.addColorStop(1, "rgba(139, 92, 246, 0.08)");
      ctx.fillStyle = prismFill;
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "rgba(139, 92, 246, 0.4)";
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Exit points on right edge of prism
      const exitPointBase = {
        x: (topVertex.x + rightVertex.x) * 0.5,
        y: (topVertex.y + rightVertex.y) * 0.5 + 10,
      };

      // Internal refraction ray (dispersing white-to-spectrum)
      const internalGrad = ctx.createLinearGradient(
        hitPoint.x,
        hitPoint.y,
        exitPointBase.x,
        exitPointBase.y
      );
      internalGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      internalGrad.addColorStop(1, "rgba(200, 220, 255, 0.6)");
      ctx.beginPath();
      ctx.moveTo(hitPoint.x, hitPoint.y);
      ctx.lineTo(exitPointBase.x, exitPointBase.y);
      ctx.strokeStyle = internalGrad;
      ctx.lineWidth = 4;
      ctx.stroke();

      // 4 Dispersed Radiant Spectral Beams
      const spectralBeams = [
        {
          color: "rgba(34, 211, 238, 0.85)", // Cyan
          glow: "rgba(34, 211, 238, 0.6)",
          exitY: exitPointBase.y - 14,
          destY: height * 0.28 + Math.sin(time + 0.2) * 8,
          spread: 14,
        },
        {
          color: "rgba(139, 92, 246, 0.85)", // Violet
          glow: "rgba(139, 92, 246, 0.6)",
          exitY: exitPointBase.y - 4,
          destY: height * 0.42 + Math.sin(time + 0.4) * 8,
          spread: 18,
        },
        {
          color: "rgba(244, 114, 182, 0.85)", // Pink
          glow: "rgba(244, 114, 182, 0.6)",
          exitY: exitPointBase.y + 6,
          destY: height * 0.58 + Math.sin(time + 0.6) * 8,
          spread: 22,
        },
        {
          color: "rgba(251, 191, 36, 0.85)", // Amber
          glow: "rgba(251, 191, 36, 0.6)",
          exitY: exitPointBase.y + 16,
          destY: height * 0.74 + Math.sin(time + 0.8) * 8,
          spread: 26,
        },
      ];

      spectralBeams.forEach((beam) => {
        const exitX = exitPointBase.x + (beam.exitY - exitPointBase.y) * 0.4;
        const destX = width;

        // Fanned ray polygon
        const beamGrad = ctx.createLinearGradient(exitX, beam.exitY, destX, beam.destY);
        beamGrad.addColorStop(0, beam.color);
        beamGrad.addColorStop(0.7, beam.color.replace("0.85", "0.4"));
        beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.moveTo(exitX, beam.exitY - 1);
        ctx.lineTo(destX, beam.destY - beam.spread);
        ctx.lineTo(destX, beam.destY + beam.spread);
        ctx.lineTo(exitX, beam.exitY + 1);
        ctx.closePath();

        ctx.fillStyle = beamGrad;
        ctx.shadowColor = beam.glow;
        ctx.shadowBlur = 15;
        ctx.fill();

        // Core central beam line
        ctx.beginPath();
        ctx.moveTo(exitX, beam.exitY);
        ctx.lineTo(destX, beam.destY);
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Animated traveling photons along each dispersed beam
        for (let p = 0; p < 2; p++) {
          const progress = ((time * 0.4 + p * 0.5) % 1);
          const photonX = exitX + (destX - exitX) * progress;
          const photonY = beam.exitY + (beam.destY - beam.exitY) * progress;
          ctx.beginPath();
          ctx.arc(photonX, photonY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = beam.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        }
      });

      // Internal sparkling caustic nodes
      ctx.shadowBlur = 0;
      for (let i = 0; i < 3; i++) {
        const px = prismCenterX + Math.sin(time * 2 + i) * 15;
        const py = prismCenterY + Math.cos(time * 1.5 + i) * 15;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] flex items-center justify-center overflow-hidden rounded-3xl border border-white/[0.06] bg-[#07080D]/70 backdrop-blur-xl group"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />

      {/* Interactive HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={420}
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Floating telemetry pills */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-[11px] font-mono text-foreground-muted">
        <span className="h-2 w-2 rounded-full bg-prism-cyan animate-pulse" />
        <span>Incident Beam: \lambda = 380-750nm</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full border border-prism-violet/30 bg-prism-violet/10 backdrop-blur-md text-[11px] font-mono text-prism-violet">
        <span className="h-1.5 w-1.5 rounded-full bg-prism-violet" />
        <span>Refraction: 4-Channel Temporal Dispersion</span>
      </div>
    </div>
  );
};
