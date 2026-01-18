import NavBar from "@/app/ui/NavBar";
import ProductEventClient from "./ProductEventClient";

export default function Products() {
    return (
        <>
            <NavBar />
            <main className="p-8">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="mt-4">
                    <ProductEventClient />
                </div>
            </main>
        </>
    )
}
