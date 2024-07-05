'use client';

import Image from "next/image";
import {Anchor, Button, Input} from "@/app/ui/form";
import { GoogleIcon, hugeiconsLicense, LockKeyIcon, Mail02Icon} from "@hugeicons/react-pro";

hugeiconsLicense('890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=');

export default function Page() {
    return (
        <>
            <div className="mb-4">
                <p className="text-gray-700 text-xl font-black">Welcome Back!</p>
                <p className="text-gray-700 text-xl font-black">Add your details to continue!</p>
            </div>

            <div className="mb-2">
                <Input placeholder="Enter Email Address" type="text" icon={<Mail02Icon size={16} />} />
            </div>

            <div className="mb-2">
                <Input placeholder="Enter Password" type="password" icon={<LockKeyIcon size={16} />} />
            </div>

            <div className="mb-2.5">
                <Button onClick={() => {}}>Sign In</Button>
            </div>

            <div className="flex justify-end mb-4">
                <Anchor>Forgot Password</Anchor>
            </div>

            <div className="mb-2.5">
                <Button onClick={() => {}} type="blue">
                    <div className="inline-flex items-center">
                        <GoogleIcon className="text-white mr-2" /> Continue with Google
                    </div>
                </Button>
            </div>

            <div className="mb-4 w-full flex items-center">
                <span className="text-xs w-full text-center">Don't have an account? <Anchor>Sign up for free</Anchor></span>
            </div>

            <div className="mb-3">
                <p className="text-xs">By continuing to use Oltukai, you agree to our <Anchor>Terms of Use</Anchor>
                    &nbsp;and <Anchor>Privacy Policy</Anchor></p>
            </div>

            <div className="w-[134.5%] h-[1px] bg-gray-200 mb-4 -ml-[4rem] "  />

            <div className="inline-flex items-center justify-center w-full">
                <Image src="/images/apple_store.svg" height={60} width={118} alt="Google play store" className="mr-2" />
                <Image src="/images/google_play_store.svg" height={90} width={118} alt="Google play store" />
            </div>
        </>
    )
}