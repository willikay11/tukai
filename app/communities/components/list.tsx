'use client';

import { useSession } from "next-auth/react";
import InterestBasedCommunities from "./interestBasedCommunities";
import { Interest } from "@/types/interest";
type ListCommunitiesProps = {
    category?: string;
  };

export default function List({ category }: ListCommunitiesProps) {
    const { data: session } = useSession();

    return (
        <>
          <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Following</p>
          {session?.user?.interests?.map((interest: Interest) => (
            <InterestBasedCommunities key={interest.id} interest={interest} />
          ))}
        </>
    )
}