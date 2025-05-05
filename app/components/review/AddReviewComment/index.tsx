'use client';

import { useEffect } from 'react';
import Comments from '../Comments/Add';
import Drawer from '@/components/ui/drawer';
type addReviewCommentProps = {
  id: string;
  reviewId: string;
  isOpen: boolean;
  closeModal: (isOpen: boolean) => void;
};

export default function AddReviewComment({
  id,
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
      <Comments placeId={id} reviewId={reviewId} />
    </Drawer>
  );
}
