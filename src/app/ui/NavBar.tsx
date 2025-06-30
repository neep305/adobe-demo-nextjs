import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-red-500 text-white p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Image src="/logo.svg" alt="logo" width={100} height={100} />
                <span className="text-2xl font-bold">JASON APP</span>
            </div>
            <ul className="flex gap-6">
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li>
                    <Link href="/products">Products</Link>
                </li>
                <li>
                    <Link href="/personalization">Personalization</Link>
                </li>
                <li>
                    <Link href="/analytics">Analytics</Link>
                </li>
            </ul>
        </div>
    </nav>
  );
}
