import Link from "next/link";
import {ReactNode} from "react";

export default function Anchor({children, link}:{children: ReactNode, link: string}) {
    return (
        <Link href={link} className="text-primary hover:underline text-xs">{children}</Link>
    )
}