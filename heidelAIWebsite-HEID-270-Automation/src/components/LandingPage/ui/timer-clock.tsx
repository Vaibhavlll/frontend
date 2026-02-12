import { motion, AnimatePresence } from 'framer-motion';

export  const TimeUnit = ({ value, label }: { value: number; label?: string }) => {
  const formattedValue = value.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center mx-0.5">
      <div className="relative h-6 w-5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center font-mono"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export const Separator = () => (
  <span className="font-mono font-bold">:</span>
);