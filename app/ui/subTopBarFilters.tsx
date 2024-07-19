'use client';

import {useEffect, useRef, useState} from "react";
import clsx from "clsx";
import {interests} from "@/app/lib/placeholderData";
import {ArrowLeft01Icon, ArrowRight01Icon} from "@hugeicons/react-pro";

export default function SubTopBarFilters() {
    let scrollBy = 500;
    const ref = useRef<any>();
    const [showPrevBtn, setShowPrevBtn] = useState<boolean>(false);
    const [showNextBtn, setShowNextBtn] = useState<boolean>(true);
    const [selectedOption, setSelectedOption] = useState<string>('hiking');

    useEffect(() => {
        if (ref.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            scrollBy = ref?.current?.offsetWidth - 100;

            window.addEventListener('resize', () => {
                if(ref?.current?.scrollWidth === ref?.current?.offsetWidth){
                    setShowNextBtn(false);
                }

                if(ref?.current?.scrollWidth > ref?.current?.offsetWidth){
                    setShowNextBtn(true);
                }
            });

            ref?.current?.addEventListener("scroll", () => {
                if ((ref.current?.offsetWidth + ref.current?.scrollLeft) >= ref?.current?.scrollWidth - 5) {
                    setShowNextBtn(false);
                }

                if (ref.current?.scrollLeft > 0) {
                    setShowPrevBtn(true);
                }

                if (ref.current?.scrollLeft === 0) {
                    setShowPrevBtn(false);
                    setShowNextBtn(true);
                }
            });
        }
    });

    return(
        <div className="w-full bg-white border-b-[1px] border-gray-100">
            <div className="grid grid-cols-12 gap-4">
                 <div className="col-start-2 col-span-10 relative">
                    <button className={clsx('p-1 border-[1px] text-gray-300 rounded-full bg-white drop-shadow-[0_0_4px_rgba(0,0,0,0.25)] absolute left-0 top-3', {
                        'hidden': !showPrevBtn,
                        'block': showPrevBtn
                    })} onClick={() => {
                        ref.current?.scrollTo({ left: ref.current?.scrollLeft - scrollBy })
                    }}>
                        <ArrowLeft01Icon size={20} className="text-gray-700" variant="twotone" />
                    </button>
                    <div ref={ref} className="h-full flex items-center overflow-hidden scroll-smooth">
                        {interests.map((option, index) => (
                            <button key={option.label}
                                    className={clsx('flex flex-col items-center justify-center h-[60px]', {
                                        'text-primary border-b-[1px] border-primary': selectedOption === option.value,
                                        'text-gray-500': selectedOption !== option.value,
                                        'mr-[25px]': index !== interests.length - 1,
                                    })}
                                    onClick={() => setSelectedOption(option.value)}
                            >
                                {option.icon}
                                <span className="text-xs text-nowrap">{option.label}</span>
                            </button>
                        ))}
                    </div>
                    <button className={clsx('p-1 border-[1px] text-gray-300 rounded-full bg-white drop-shadow-[0_0_4px_rgba(0,0,0,0.25)] absolute right-0 top-3', {
                        'hidden': !showNextBtn,
                        'block': showNextBtn
                    })} onClick={() => {
                        ref.current?.scrollTo({ left: ref.current?.scrollLeft + scrollBy })
                    }}>
                        <ArrowRight01Icon size={20} className="text-gray-700" variant="twotone" />
                    </button>
                </div>
            </div>
        </div>
    );
}