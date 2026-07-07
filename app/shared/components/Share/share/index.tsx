'use client';

import { useState } from 'react';

import {
  CopyLinkIcon,
  Facebook02Icon,
  Mail01Icon,
  Message01Icon,
  MessengerIcon,
  Share08Icon,
  WhatsappIcon,
} from '@hugeicons/react-pro';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { TukaiImage } from '@/components/ui/image';

const shareOptions = [
  {
    title: 'Copy Link',
    icon: <CopyLinkIcon size={16} variant="twotone" className="text-primary" />,
  },
  {
    title: 'Email',
    icon: <Mail01Icon size={16} variant="twotone" className="text-primary" />,
  },
  {
    title: 'Messages',
    icon: <Message01Icon size={16} variant="twotone" className="text-primary" />,
  },
  {
    title: 'WhatsApp',
    icon: <WhatsappIcon size={16} variant="twotone" className="text-primary" />,
  },
  {
    title: 'Messenger',
    icon: <MessengerIcon size={16} variant="twotone" className="text-primary" />,
  },
  {
    title: 'Facebook',
    icon: <Facebook02Icon size={16} variant="twotone" className="text-primary" />,
  },
];

export const Share = ({
  coverPhoto,
  title,
  link,
}: {
  coverPhoto: string;
  title: string;
  link: string;
}) => {
  const [open, setOpen] = useState(false);

  const handleShare = (option: string) => {
    if (option === 'Copy Link') {
      navigator.clipboard.writeText(link);
    }

    if (option === 'Email') {
      window.open(`mailto:?subject=${title}&body=${link}`, '_blank');
    }

    if (option === 'Messages') {
      window.open(`sms:?body=${link}`, '_blank');
    }

    if (option === 'WhatsApp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(link)}`, '_blank');
    }

    if (option === 'Messenger') {
      window.open(`https://m.me/${link}`, '_blank');
    }

    if (option === 'Facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, '_blank');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex items-center gap-2
          px-5 py-2.5 rounded-full
          bg-white border border-gray-200
          text-gray-800 text-sm font-medium
          hover:border-gray-300 hover:bg-gray-50
          transition-colors
        "
      >
        <span>Share</span>
        <Share08Icon size={16} className="text-gray-800" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="px-6 md:w-[24rem]">
          <div className="flex flex-col gap-4">
            <DialogTitle className="text-2xl font-black text-gray-700">Share Location</DialogTitle>
            <DialogDescription className="sr-only">
              Share {title} via various social media platforms and messaging apps
            </DialogDescription>
            <div className="relative aspect-square h-[10.25rem] w-full">
              <TukaiImage
                src={coverPhoto}
                alt={title}
                quality={100}
                fill
                className="rounded-2xl"
                style={{ objectFit: 'cover' }}
              />
            </div>

            <p className="text-base font-bold text-gray-600">{title}</p>

            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option) => (
                <Button
                  key={option.title}
                  variant="primary-light"
                  className="w-full justify-between"
                  onClick={() => handleShare(option.title)}
                >
                  {option.title}
                  {option.icon}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
