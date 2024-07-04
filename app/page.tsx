import Image from "next/image";
import Nav from "@/app/ui/nav";
import AuthActions from "@/app/ui/authActions";

export default function Home() {
  return (
    <main className="h-full grid grid-cols-12 gap-4">
        <div className="col-span-12">
            <div className="h-[80px] w-full bg-gray-50"></div>
        </div>
      {/*<Image*/}
      {/*    alt="Mountains"*/}
      {/*    src="/images/hill-decent.svg"*/}
      {/*    quality={100}*/}
      {/*    fill*/}
      {/*    sizes="100vw"*/}
      {/*    style={{*/}
      {/*      objectFit: 'cover',*/}
      {/*      backgroundPosition: 'center',*/}
      {/*      zIndex: -1*/}
      {/*    }}*/}
      {/*/>*/}
    </main>
  );
}
