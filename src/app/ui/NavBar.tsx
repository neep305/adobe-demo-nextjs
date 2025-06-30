import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between">
            <Image src="/logo.svg" alt="logo" width={100} height={100} />
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
