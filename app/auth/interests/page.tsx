'use client';
import {interests} from "@/app/lib/placeholderData";
import {hugeiconsLicense} from "@hugeicons/react-pro";
import {useState} from "react";
import {Button} from "@/app/ui/form";
import clsx from "clsx";
import {useRouter} from "next/navigation";

hugeiconsLicense('890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=');
export default function Page() {
    const router = useRouter()
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const addOrRemoveInterest = (value: string) => {
        if (selectedInterests.includes(value)) {
            setSelectedInterests(selectedInterests.filter((selectedInterest) => selectedInterest !== value));
        } else {
            setSelectedInterests([...selectedInterests, value]);
        }
    }

    return(
        <>
            <div className="mb-2">
                <p className="text-gray-700 text-xl font-black">Select your interests</p>
            </div>

            <div className="mb-2">
                <p className="text-gray-700 text-xs">What are some of your favorite experiences?</p>
            </div>

            <div className="inline-flex flex-wrap gap-x-2 gap-y-2 mb-4">
                {
                    interests.map((interest) => {
                        const active = selectedInterests.includes(interest.value);
                        return (
                            <div key={interest.value}
                                 onClick={() => addOrRemoveInterest(interest.value)}
                                 className={clsx('inline-flex items-center rounded-full px-4 py-2 w-fit cursor-pointer',
                                     {
                                         'bg-primary text-white': active,
                                         'bg-gray-100': !active
                                     })}>
                                <div className="mr-2">
                                    {interest.icon}
                                </div>
                                <span className="text-xs">{interest.label}</span>
                            </div>
                        );
                    })
                }
            </div>

            <div>
                <Button block onClick={() => router.push('/auth/payments')}>Submit</Button>
            </div>
        </>
    )
}