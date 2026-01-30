import ListPlaces from './components/list';

export default async function Home() {
  return (
    <main className="mt-4 grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-6 md:col-start-4 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4 md:mx-0">
        <ListPlaces />
      </div>
    </main>
  );
}
