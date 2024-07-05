'use client';

import Link from "next/link";
import {UserAdd01Icon} from "@hugeicons/react-pro";

export default function AuthActions() {
    return(
        <div className="flex items-center">
            <Link href="">
                <span className="text-xs text-gray-800">Become A Tour Guide</span>
            </Link>
            <div className="h-[10px] w-[1px] bg-secondary mx-2" />
            <Link href="/auth/sign-in" className="inline-flex">
                <UserAdd01Icon size={15} className="text-gray-700 mr-2" />
                <span className="text-xs text-gray-800">Sign In/Sign Up</span>
            </Link>
        </div>
    );
}