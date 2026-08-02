import { motion, useReducedMotion } from 'framer-motion';
import type { ConversationLine } from '@/content/types';
import { Button } from '@/components/ui/Button';
import { clsx } from '@/lib/clsx';

interface ExampleConversationProps {
  lines: ConversationLine[];
  onContinue: () => void;
}

export function ExampleConversation({ lines, onContinue }: ExampleConversationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
        In conversation
      </p>
      <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-card">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : i * 0.18 }}
            className={clsx('flex flex-col', line.from === 'you' ? 'items-end' : 'items-start')}
          >
            {line.speaker && (
              <span className="mb-0.5 px-1 text-[10px] font-bold uppercase tracking-wide text-sg-navy/35">
                {line.speaker}
              </span>
            )}
            <div
              className={clsx(
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-medium',
                line.from === 'you'
                  ? 'rounded-br-sm bg-sg-blue text-white'
                  : 'rounded-bl-sm bg-sg-bg text-sg-navy',
              )}
            >
              {line.text}
            </div>
          </motion.div>
        ))}
      </div>
      <Button variant="primary" size="lg" className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
