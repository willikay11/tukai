'use client';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import clsx from "clsx";

const links = [
    { name: 'Explore', href: '/' },
    {
        name: 'Experiences',
        href: '/experiences',
    },
    { name: 'Community', href: '/community' },
];

export default function Nav() {
    const pathname = usePathname();

    return(
        <>
            {
                links.map((link) => (
                    <Link href={link.href} key={link.name} className={clsx('mr-4 h-full', {
                        'border-b-[1px] border-primary': pathname === link.href
                    })}>
                        <span className={clsx("text-xs", {
                            'text-primary font-semibold': pathname === link.href
                        })}>{link.name}</span>
                    </Link>
                ))
            }
        </>
    );
}