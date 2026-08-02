import { motion } from 'framer-motion';
import { clsx } from '@/lib/clsx';

interface ChatBubbleThreadProps {
  thread: { from: 'them' | 'you'; text: string }[];
}

export function ChatBubbleThread({ thread }: ChatBubbleThreadProps) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-white p-4 shadow-card">
      {thread.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
          className={clsx(
            'flex',
            msg.from === 'you' ? 'justify-end' : 'justify-start',
          )}
        >
          <div
            className={clsx(
              'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-medium',
              msg.from === 'you'
                ? 'rounded-br-sm bg-sg-blue text-white'
                : 'rounded-bl-sm bg-sg-bg text-sg-navy',
            )}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
