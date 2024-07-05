import Image from "next/image";
import IconRadioButtonGroup from "@/app/ui/iconRadioButtonGroup";
import {Input} from "@willikay11/solgates-component-library";
import SubTopBar from "@/app/ui/subTopBar";
import SubTopBarFilters from "@/app/ui/subTopBarFilters";

export default function Home() {
  return (
    <main className="h-full grid grid-cols-12 gap-4">
        <div className="col-span-12">
            <SubTopBar />
            <SubTopBarFilters />
        </div>
    </main>
  );
}
