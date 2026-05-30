import { useEffect, useRef } from 'react';

export default function PixelTrail({
  gridSize = 48,
  trailSize = 0.09,
  maxAge = 250,
  color = '#00f3ff',
  opacity = 0.5
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number, y: number, age: number, maxAge: number }[] = [];
    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMoving = false;
    let timeout: any;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      clearTimeout(timeout);
      
      // Add particle
      particles.push({
        x: mouseX,
        y: mouseY,
        age: 0,
        maxAge: maxAge + Math.random() * 50
      });

      timeout = setTimeout(() => {
        isMoving = false;
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += 16; // Approx 60fps step

        if (p.age > p.maxAge) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.age / p.maxAge;
        const currentSize = gridSize * trailSize * (1 - progress);
        const currentOpacity = opacity * (1 - Math.pow(progress, 2));

        ctx.fillStyle = color;
        ctx.globalAlpha = currentOpacity;
        
        // Pixel style rect
        const px = Math.floor(p.x / (gridSize * trailSize)) * (gridSize * trailSize);
        const py = Math.floor(p.y / (gridSize * trailSize)) * (gridSize * trailSize);
        
        ctx.fillRect(px, py, currentSize, currentSize);
      }
      ctx.globalAlpha = 1.0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, [gridSize, trailSize, maxAge, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
