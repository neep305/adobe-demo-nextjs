import NavBar from "./ui/NavBar";
import MainSwiper from "./components/MainSwiper";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Home</h1>
        <MainSwiper />
      </main>
    </>
  );
}
