import ListPlaces from './components/list';

export default async function Home() {
  return (
    <main className="mt-4 grid h-full grid-cols-12 gap-4 px-4 md:px-0">
      <div className="col-span-12 mb-4 md:col-span-10 md:col-start-2 md:mx-0">
        <ListPlaces />
      </div>
    </main>
  );
}
