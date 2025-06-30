"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function MainSwiper() {
    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={50}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                loop={false}
            >
                <SwiperSlide>
                    <div className="bg-green-500 text-white h-64 flex items-center justify-center text-2xl">
                        기본 배너 1
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="bg-blue-500 text-white h-64 flex items-center justify-center text-2xl">
                        기본 배너 2
                    </div>
                </SwiperSlide>
                {/* Personalization banner */}
                <SwiperSlide>
                    <div className="bg-purple-500 text-white h-64 flex items-center justify-center text-2xl" id="personalization-banner">
                        Personalization banner
                    </div>
                </SwiperSlide>
                
            </Swiper>
        </div>
    )
}