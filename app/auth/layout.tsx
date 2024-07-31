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
        class: 'text-blue-400'
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
    const animationElement = useRef<any>();
    const [optionIndex, setOptionIndex] = useState<number>(0);

    useEffect(() => {
        animationElement?.current.addEventListener('animationiteration', () => {
            setOptionIndex(optionIndex => optionIndex < options.length - 1 ? optionIndex + 1 : 0)
        });
    }, [animationElement]);

    return(
        <div className="h-screen">
            <Image
                alt="Mountains"
                src={backgroundImages.find((backgroundImage) => backgroundImage.path === pathname)?.image ?? 'images/hill-decent.svg'}
                quality={100}
                width={100}
                height={100}
                sizes="100vw"
                className="top-6 md:top-20"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '115vh',
                    objectFit: 'cover',
                    backgroundPosition: 'center',
                    zIndex: -1,
                }}
            />
            <div className="flex flex-col items-center justify-center mt-4 md:mt-12">
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
                <div className="bg-white rounded-[15px] mx-2.5 md:mx-0 md:w-[30.938rem]">
                    <div className="px-8 md:px-16 py-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}