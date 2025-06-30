import MainSwiper from "@/app/components/MainSwiper";
import NavBar from "@/app/ui/NavBar";

export default function Personalization() {
    return (
        <>
            <NavBar />
            <main className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold">Personalization</h1>
                <MainSwiper />
            </main>
        </>
    )
}
