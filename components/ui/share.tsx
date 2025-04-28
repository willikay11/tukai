'use client';

import { Dialog } from './dialog';
import Image from 'next/image';

import { DialogContent } from './dialog';
import {
  CopyLinkIcon,
  Share08Icon,
  Mail01Icon,
  Message01Icon,
  WhatsappIcon,
  MessengerIcon,
  Facebook02Icon,
} from '@hugeicons/react-pro';
import { useState } from 'react';
import { Button } from './button';

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

export default function Share({
  coverPhoto,
  title,
  link,
}: {
  coverPhoto: string;
  title: string;
  link: string;
}) {
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
      window.open(`https://wa.me/?text=${link}`, '_blank');
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
      <Share08Icon
        size={16}
        variant="twotone"
        className="cursor-pointer text-primary"
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="px-12">
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-black text-gray-700">Share Location</p>

            <div className="relative aspect-square h-[10.25rem] w-full">
              <Image
                src={coverPhoto}
                alt={title}
                quality={100}
                layout="fill"
                objectFit="cover"
                className="rounded-2xl"
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
}
