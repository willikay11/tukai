'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Comments from './comments';

type addReviewCommentProps = {
  placeId: string;
  reviewId: string;
  isOpen: boolean;
  closeModal?: () => void;
};

export default function AddReviewComment({
  placeId,
  reviewId,
  isOpen,
  closeModal,
}: addReviewCommentProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 bg-black/50">
        {/* Clickable backdrop */}
        <div className="absolute inset-0" onClick={() => closeModal?.()}></div>

        <div className="grid grid-cols-12">
          <div className="relative col-span-12 h-screen md:col-span-6 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0rem', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
              className="absolute bottom-0 h-fit min-h-48 w-full rounded-t-2xl bg-white px-16 pb-4 pt-8 shadow-xl"
            >
              <Comments placeId={placeId} reviewId={reviewId} />
            </motion.div>
          </div>
        </div>
      </div>
    )
  );
}
