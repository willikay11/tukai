'use client';
import Image from "next/image";
import {Bookmark02Icon, StarIcon} from "@hugeicons/react-pro";
import {Experience} from "@/app/lib/definitions";
import {useState} from "react";
import clsx from "clsx";

export default function SingleExperience({experience}: {experience: Experience}) {
    const [rated, setRated] = useState<boolean>(false);
    const [bookmarked, setBookmarked] = useState<boolean>(false);
    return (
        <>
            <div className="flex flex-col mb-2 relative">
                <Image src={experience.image} height={320} width={320} layout="responsive" alt={experience.name} />
                <div className="absolute top-2 right-2 cursor-pointer" onClick={() => setBookmarked(!bookmarked)}>
                    <Bookmark02Icon size={16} className={clsx('', {
                        'text-white': !bookmarked,
                        'text-red-600': bookmarked
                    })} variant={bookmarked ? 'solid' : 'twotone'} />
                </div>
            </div>
            <div className="flex flex-col items-start justify-start bg-white">
                <div className="flex mb-1">
                    <p className="text-xs text-gray-800 font-bold">{experience.name}</p>
                </div>
                <div className="inline-flex mb-1 items-center ">
                    <span className="text-xs text-gray-600">{experience.location}</span>
                    <div className="h-[6px] w-[1px] rounded bg-gray-300 mx-1" />
                    <span className="text-xs text-gray-600">{experience.distance}</span>
                    <div className="h-[6px] w-[1px] rounded bg-gray-300 mx-1" />
                    <span className="text-xs text-gray-600">{experience.duration}</span>
                </div>
                <div className="inline-flex items-center">
                    <StarIcon variant="solid" size={14} className={clsx('mr-1', {
                        'text-yellow-400': rated,
                        'text-gray-300': !rated,
                    })} onClick={() => setRated(!rated)} />
                    <span className="text-xs text-gray-600">{experience.rating}</span>
                    <div className="h-[6px] w-[1px] rounded bg-gray-300 mx-1" />
                    <span className="text-xs text-gray-600">{experience.reviews} Reviews</span>
                </div>
            </div>
        </>
    )
}