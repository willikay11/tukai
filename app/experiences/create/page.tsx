import CreateExperienceSteps from "./components/steps";

export default function CreateExperiencePage() {
  return (
    <main className="grid h-full grid-cols-12 gap-4 px-4 md:px-0 mt-6">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-6 lg:col-start-3 xl:col-span-4 xl:col-start-3 3xl:col-span-4 3xl:col-start-3 4xl:col-span-4 4xl:col-start-3">
        <CreateExperienceSteps currentStep="about" />
      </div>
    </main>
  );
}
