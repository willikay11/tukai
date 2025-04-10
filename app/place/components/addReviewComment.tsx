'use client';

import { useEffect } from 'react';
import Comments from './comments';
import Drawer from '@/components/ui/drawer';
type addReviewCommentProps = {
  placeId: string;
  reviewId: string;
  isOpen: boolean;
  closeModal: (isOpen: boolean) => void;
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
    <Drawer isOpen={isOpen} setIsOpen={closeModal}>
      <Comments placeId={placeId} reviewId={reviewId} />
    </Drawer>
  );
}
