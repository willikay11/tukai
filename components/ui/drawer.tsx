import { AnimatePresence, motion } from 'framer-motion';

export default function Drawer({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 items-end bg-black/50">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="grid h-screen grid-cols-12">
            <div className="col-span-12 flex flex-col justify-end md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
              <motion.div
                initial={{ y: '100%', opacity: 0, transition: { duration: 0.5 } }}
                animate={{ y: '0rem', opacity: 1 }}
                exit={{ y: '100%', opacity: 0, transition: { duration: 0.5 } }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="relative h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl"
                style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
