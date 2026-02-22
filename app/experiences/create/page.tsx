'use client';

import CreateExperienceAbout from './pages/about';
import CreateExperienceType from './pages/type';

export default function CreateExperiencePage() {
  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 py-8 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-2 xl:col-span-4 xl:col-start-2 3xl:col-span-4 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
        {/* <CreateExperienceType /> */}
        <CreateExperienceAbout />
      </div>
    </main>
  );
}
