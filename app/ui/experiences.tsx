import {Experience} from "@/app/lib/definitions";
import Image from "next/image";
import {hugeiconsLicense, StarIcon} from "@hugeicons/react-pro";
import {fetchExperiences} from "@/app/lib/data";

hugeiconsLicense('890e3333f427f30eb0b744e4d32392a6RT00NzkxODg2MzcwMDAwLFM9cHJvLFY9MSxQPUd1bXJvYWQsU1Q9QjVBMzQ1NzMsRVQ9MDIxMUY0RkM=');

export default async function Experiences(){
    const experiences: Experience[] = await fetchExperiences(); // Fetch data inside the component

    return(
        <div className="grid grid-cols-12 gap-x-4 gap-y-8">
            {experiences.map((experience) => (
                <div key={experience.id} className="cursor-pointer col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
                    <div className="flex flex-col mb-2">
                        <Image src={experience.image} height={320} width={320} alt={experience.name} />
                    </div>
                    <div className="flex flex-col items-start justify-start bg-white">
                        <div className="flex mb-1">
                            <p className="text-xs text-gray-800 font-bold">{experience.name}</p>
                        </div>
                        <div className="inline-flex mb-1 items-center ">
                            <span className="text-xs text-gray-600">{experience.location}</span>
                            <div className="h-[6px] w-[1px] rounded bg-gray-300 mx-1" />
                            <span className="text-xs text-gray-600">{experience.distance}</span>
                            <div className="h-[6px] w-[1px] rounded bg-gray-300 mx-1" />
                            <span className="text-xs text-gray-600">{experience.duration}</span>
                        </div>
                        <div className="inline-flex items-center">
                            <StarIcon size={20} className="text-yellow-400 mr-1" />
                            <span className="text-xs text-gray-600">{experience.rating}</span>
                            <div className="h-[6px] w-[1px] rounded bg-gray-300 mx-1" />
                            <span className="text-xs text-gray-600">{experience.reviews} Reviews</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}