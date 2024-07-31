'use client';

import Image from "next/image";
import {Anchor, Button, Input} from "@/app/ui/form";
import {GoogleIcon, hugeiconsLicense, LockKeyIcon, Mail02Icon, UserIcon} from "@hugeicons/react-pro";
import {useRouter} from "next/navigation";
import MobileStore from "@/app/ui/mobileStore";

hugeiconsLicense('890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=');

export default function Page() {
    const router = useRouter()
    return (
        <>
            <div className="mb-4">
                <p className="text-gray-700 text-xl font-black">Create an account to access</p>
                <p className="text-gray-700 text-xl font-black">Experiences & Join Communities</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
                <Input placeholder="First Name" type="text" icon={<UserIcon size={16} />} />
                <Input placeholder="Last Name" type="text" icon={<UserIcon size={16} />} />
            </div>

            <div className="mb-2">
                <Input placeholder="Enter Email Address" type="text" icon={<Mail02Icon size={16} />} />
            </div>

            <div className="mb-2">
                <Input placeholder="Enter Password" type="password" icon={<LockKeyIcon size={16} />} />
            </div>

            <div className="mb-2">
                <Input placeholder="Confirm Password" type="password" icon={<LockKeyIcon size={16} />} />
            </div>

            <div className="mb-2.5">
                <Button block onClick={() => router.push('/auth/interests')}>Create a Free Account</Button>
            </div>


            <div className="mb-4 w-full flex items-center">
                <span className="text-xs w-full text-center">Already have an account? <Anchor link="/auth/sign-in">Sign in</Anchor></span>
            </div>

            <div className="mb-3">
                <p className="text-xs">By continuing to use Oltukai, you agree to our <Anchor link="">Terms of Use</Anchor>
                    &nbsp;and <Anchor link="">Privacy Policy</Anchor></p>
            </div>

            <div className="h-[1px] bg-gray-200 mb-4 -mx-[1.875rem] md:-mx-[3.875rem]" />

            <MobileStore />
        </>
    )
}