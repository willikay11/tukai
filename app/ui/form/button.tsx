import {ReactNode} from "react";
import clsx from "clsx";

export default function Button({children, onClick , type = 'primary' }: { children: ReactNode, onClick: () => void, type?: 'primary' | 'blue'}) {
    return(
        <button className={clsx('w-full h-[3.375rem] rounded-[8px] text-xs text-white', {
            'bg-primary': type === 'primary',
            'bg-blue-500': type === 'blue',
        })} onClick={onClick}>{children}</button>
    )
}