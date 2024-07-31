'use client';

import Image from "next/image";
import {usePathname} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import clsx from "clsx";

const backgroundImages = [
    {
        image: '/images/hill-decent.svg',
        path: '/auth/sign-in'
    },
    {
        image: '/images/hikers-walking.svg',
        path: '/auth/sign-up'
    },
    {
        image: '/images/infinite-pool.svg',
        path: '/auth/sign-up-free'
    },
    {
        image: '/images/kilimanjaro.svg',
        path: '/auth/interests'
    },
    {
        image: '/images/man-bridge-running.svg',
        path: '/auth/payments'
    },
    {
        image: '/images/santorini.svg',
        path: '/auth/subscribe'
    }
];

const options = [
    {
        label: 'Night life',
        class: 'text-blue-600'
    },
    {
        label: 'Hiking',
        class: 'text-teal-400'
    },
    {
        label: 'Camping',
        class: 'text-yellow-400'
    }
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const animationElement = useRef();
    const [optionIndex, setOptionIndex] = useState<number>(0);

    useEffect(() => {
        animationElement.current.addEventListener('animationiteration', () => {
            setOptionIndex(optionIndex => optionIndex < options.length - 1 ? optionIndex + 1 : 0)
        });
    }, [animationElement]);

    return(
        <div>
            <Image
                alt="Mountains"
                src={backgroundImages.find((backgroundImage) => backgroundImage.path === pathname)?.image ?? 'images/hill-decent.svg'}
                quality={100}
                fill
                sizes="100vw"
                style={{
                    objectFit: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                    top: '5rem'
                }}
            />
            <div className="flex flex-col items-center justify-center mt-12">
                <div className="text-center mb-4">
                    <p className="text-white text-4xl font-black mb-2">
                        Plan & Discover
                    </p>
                    <p
                       ref={animationElement}
                       className={`text-4xl font-black fade-in-out ${options[optionIndex].class}`}>
                        {options[optionIndex].label}
                    </p>
                </div>
                <div className="bg-white rounded-[15px] w-[30.938rem]">
                    <div className="px-16 py-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}