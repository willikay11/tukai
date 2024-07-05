import Link from "next/link";
import {ReactNode} from "react";

export default function Anchor({children}:{children: ReactNode}) {
    return (
        <Link href="" className="text-primary hover:underline text-xs">{children}</Link>
    )
}