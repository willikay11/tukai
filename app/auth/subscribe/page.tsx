'use client';

import {
    Calendar04Icon,
    CallIcon,
    CreditCardIcon,
    GlobalIcon,
    hugeiconsLicense, Loading02Icon, Loading03Icon,
    PinLocation02Icon,
    SquareLock01Icon
} from "@hugeicons/react-pro";
import clsx from "clsx";
import {useEffect, useState} from "react";
import {Anchor, Button, Input} from "@/app/ui/form";
import Image from "next/image";
import {useRouter} from "next/navigation";

hugeiconsLicense('890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=');

const options = [
    {
        label: 'M-Pesa',
        value: 'mpesa',
        icon: {
            src: '/images/mpesa.png',
            height: 20,
            width: 40,
        }
    },
    {
        label: 'Credit Card',
        value: 'credit-card',
        icon: {
            src: '/images/mastercard.png',
            height: 18,
            width: 30,
        }
    },
];

export default function Page() {
    const router = useRouter()
    const [selectedOption, setSelectedOption] = useState('mpesa');
    const [paymentSent, setPaymentSent] = useState<boolean>(false);

    useEffect(() => {
        if (paymentSent) {
            setTimeout(() => {
                router.push(`/`);
            }, 2000);
        }
    }, [paymentSent]);

    if (paymentSent) {
        return (
            <div className="px-4 md:px-8">
                <div className="flex justify-center w-full mb-2">
                    <Loading03Icon size={42} className="text-gray-500" />
                </div>

                <div className="mb-2">
                    <p className="text-gray-700 text-xs mb-1">A payment request was sent to <span className="font-medium">+254 716 909 815</span>.</p>
                    <p className="text-gray-700 text-xs"> Please enter the M-Pesa pin to complete the payment.</p>
                </div>

                <div className="flex">
                    <p className="text-gray-700 text-xs">Wrong Number? <Anchor link="">Edit</Anchor></p>
                </div>
            </div>
        );
    }
    return(
        <>
            <div className="mb-2">
                <p className="text-gray-700 text-xl font-black">Subscribe to Oltukai.</p>
            </div>

            <div className="mb-2">
                <p className="text-gray-700 text-xs">We send you reminders every month before making any deductions.</p>
            </div>

            <div className="mb-2">
                <p className="text-gray-700 text-xs">Please select your preferred payment method below:</p>
            </div>

            <div className="mb-2 flex flex-col">
                {
                    options.map((option) => (
                        <div key={option.value} className="inline-flex items-center mb-2 cursor-pointer" onClick={() => setSelectedOption(option.value)}>
                            <div className={clsx('inline-flex items-center justify-center bg-white  h-4 w-4 border-[1px] rounded-full  focus:ring-blue-300 checked:text-orange-600 checked:hover:bg-orange-600 checked:active:bg-orange-600 checked:focus:bg-orange-600 focus:border-transparent focus:ring-0', {
                                'border-primary': selectedOption === option.value,
                                'border-gray-300': selectedOption !== option.value
                            })}
                            >
                                <div className={clsx('h-2.5 w-2.5 bg-primary rounded-full', {
                                    'hidden': selectedOption !== option.value,
                                    'block': selectedOption === option.value,
                                })} />
                            </div>
                            <span className={clsx("ml-2 text-xs text-gray-700 inline-flex items-center", {
                                'font-bold': selectedOption === option.value,
                                'font-normal': selectedOption !== option.value,
                            })}>{option.label}
                                <div className="h-[6px] w-[1px] rounded-[2px] bg-gray-300 mx-2" />
                                <Image src={option.icon.src} alt={option.label} className={`h-[${option.icon.height}px] !w-[${option.icon.width}px]`} height={option.icon.height} width={option.icon.width} />
                            </span>
                        </div>
                    ))
                }
            </div>

            {
                selectedOption === 'mpesa' ? (
                    <div className="mb-4">
                        <Input placeholder="Enter M-Pesa number" type="text" icon={<CallIcon size={20} className="text-gray-600" />} />
                    </div>
                ) : (
                    <>
                        <div className="mb-2">
                            <Input placeholder="Card Number" type="text" icon={<CreditCardIcon size={20} className="text-gray-600" />} />
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 mb-2">
                            <Input placeholder="Expiry Date" type="text" icon={<Calendar04Icon size={20} className="text-gray-600" />} />

                            <Input placeholder="CVV" type="text" icon={<SquareLock01Icon size={20} className="text-gray-600" />} />
                        </div>

                        <div className="mb-2">
                            <Input placeholder="Postcode" type="text" icon={<PinLocation02Icon size={20} className="text-gray-600" />} />
                        </div>

                        <div className="mb-2">
                            <Input placeholder="Country/Region" type="text" icon={<GlobalIcon size={20} className="text-gray-600" />} />
                        </div>
                    </>
                )
            }


            <div className="mb-4">
                <Button onClick={() => setPaymentSent(true)}>Submit</Button>
            </div>

            <div className="flex items-center justify-center w-full">
                <Anchor link="/">Cancel</Anchor>
            </div>
        </>
    )
}