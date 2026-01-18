"use client";

import { useEffect } from 'react';
import { track } from "@/lib/analytics/track";

export default function ProductEventClient() {
    useEffect(() => {
        void track("page_view", { pageName: "products" });
    }, []);

    const handleBuyClick = () => {
        void track("cta_click", { name: "product_buy" });
    }

    return (
        <button
            onClick={handleBuyClick}
            className='bg-red-600 text-white px-4 py-2 rounded'>
            Buy
        </button>
    )
}
