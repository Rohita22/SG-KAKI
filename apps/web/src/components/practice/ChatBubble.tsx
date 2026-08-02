import { motion } from 'framer-motion';
import type { ChatMessage } from '@/content/types';
import { clsx } from '@/lib/clsx';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={clsx(
          'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm font-medium',
          isUser
            ? 'rounded-br-sm bg-sg-blue text-white'
            : 'rounded-bl-sm bg-white text-sg-navy shadow-sm',
        )}
      >
        {message.text}
      </div>
    </motion.div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-sg-navy/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
