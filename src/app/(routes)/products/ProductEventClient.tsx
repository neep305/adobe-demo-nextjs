'use client';

import { useEffect } from 'react';

export default function ProductEventClient() {
    useEffect(() => {
        console.log('ProductEventClient');

        (window as any).dataLayer?.push({
            event: 'pageview',
            pageCategory: 'Products',
        });
    }, []);

    const handleBuyClick = () => {
        console.log('Buy clicked');
        (window as any).dataLayer?.push({
            event: 'product_click',
            product_name: 'Product 1',
            product_price: 100,
            product_id: '123',
        });
    }

    return (
        <button
            onClick={handleBuyClick}
            className='bg-red-600 text-white px-4 py-2 rounded'>
            Buy
        </button>
    )
}
