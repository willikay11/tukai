'use client';

import Image from "next/image";
import {usePathname} from "next/navigation";

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
    }
]
export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

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
                    <p className="text-blue-600 text-4xl font-black">
                        Night Life
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