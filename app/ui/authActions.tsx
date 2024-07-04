'use client';

import Link from "next/link";

export default function AuthActions() {
    return(
        <div className="flex items-center">
            <Link href="">
                <span className="text-xs">Become A Tour Guide</span>
            </Link>
            <div className="h-4 w-[1px] bg-secondary mx-1" />
            <Link href="/auth">
                <span className="text-xs">Sign In/Sign Up</span>
            </Link>
        </div>
    );
}