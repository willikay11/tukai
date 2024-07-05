'use client';

import Image from "next/image";
import {Anchor, Button } from "@/app/ui/form";
import { GoogleIcon, hugeiconsLicense } from "@hugeicons/react-pro";

hugeiconsLicense('890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=');

export default function Page() {
    return (
        <>
            <div className="mb-4">
                <p className="text-gray-700 text-xl font-black">Create your free account</p>
            </div>

            <div className="mb-4">
                <Button onClick={() => {}}>Create a Free Account</Button>
            </div>

            <div className="flex items-center mb-4">
                <div className="h-[1px] flex-grow rounded-[20px]" style={{ background: 'linear-gradient(90deg, rgba(4, 120, 87, 0.00) 0%, #047857 100%)' }} />
                    <span className="mx-4 text-xs">Or</span>
                <div className="h-[1px] flex-grow rounded-[20px]" style={{ background: 'linear-gradient(90deg, #047857 0%, rgba(4, 120, 87, 0.00) 100%)' }} />
            </div>

            <div className="mb-2.5">
                <Button onClick={() => {}} type="blue">
                    <div className="inline-flex items-center">
                        <GoogleIcon className="text-white mr-2" /> Continue with Google
                    </div>
                </Button>
            </div>

            <div className="mb-4 w-full flex items-center">
                <span className="text-xs w-full text-center">Already have an account? <Anchor>Sign in</Anchor></span>
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