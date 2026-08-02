import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const COLORS = ['#FBBF24', '#2563EB', '#22C55E', '#8B5CF6', '#F97316', '#ffffff'];

interface Particle {
  x: number;
  rotate: number;
  color: string;
  delay: number;
  size: number;
}

export function Confetti({ count = 24 }: { count?: number }) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 280,
        rotate: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 6,
      })),
    [count],
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: -20, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: 220, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeIn' }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size * 0.5, background: p.color }}
        />
      ))}
    </div>
  );
}
