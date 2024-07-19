import {ReactNode} from "react";

export default function Input({ placeholder, type, icon }: { placeholder: string, type: 'text' | 'password', icon: ReactNode }) {
    return(
        <div className="pl-4 inline-flex h-[3.375rem] items-center border-[1px] focus:border-primary hover:border-primary rounded-[8px] w-full">
            <div className="mr-2 text-gray-500">
                {icon}
            </div>
            <input className="w-full text-gray-500 text-xs placeholder:text-xs outline-0" placeholder={placeholder} type={type} />
        </div>
    );
}