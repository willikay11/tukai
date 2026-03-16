import CreateExperienceType from './components/type';

export default function CreateExperienceTypePage() {
  return (
    <main className="mt-6 grid min-h-screen grid-cols-12 items-stretch gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-4 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-2 3xl:col-start-4 4xl:col-span-2 4xl:col-start-5">
        <CreateExperienceType />
      </div>
    </main>
  );
}
