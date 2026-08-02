import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { activeCountryPack } from '@/content/activeCountryPack';
import { Button } from '@/components/ui/Button';

export function MissionUnlockedRoute() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  const mission = activeCountryPack.missions.find((m) => m.id === missionId);
  if (!mission) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl items-center p-4 sm:p-6 lg:p-10">
      <div className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl bg-sg-navy px-6 py-14 text-center text-white lg:py-20">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="size-72 rounded-full bg-sg-xp/10 blur-3xl lg:size-96" />
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: [0, 1.3, 1], rotate: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative flex size-24 items-center justify-center rounded-full bg-sg-xp/20 lg:size-32"
        >
          <motion.span
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute"
          >
            <Lock className="size-10 text-sg-xp lg:size-12" />
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 260 }}
            className="text-4xl lg:text-6xl"
          >
            {mission.icon}
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative mt-6 text-2xl font-black lg:text-4xl"
        >
          New Mission Unlocked!
        </motion.h1>

        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative mt-2 text-lg font-bold text-sg-xp lg:text-xl"
        >
          {mission.icon} {mission.title}
        </motion.p>
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="relative mt-1 text-sm text-white/60"
        >
          {mission.subtitle}
        </motion.p>

        <div className="relative mt-10 flex w-full max-w-xs flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate(`/missions/${mission.id}`, { replace: true })}
          >
            Start Mission
          </Button>
          <Button
            variant="ghost"
            className="w-full text-white/60"
            onClick={() => navigate('/map', { replace: true })}
          >
            Back to Journey
          </Button>
        </div>
      </div>
    </div>
  );
}
