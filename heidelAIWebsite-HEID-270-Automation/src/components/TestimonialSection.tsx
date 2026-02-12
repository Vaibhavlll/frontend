'use client';

// import { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { AnimateInView } from './AnimateInView';

import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
    {
        rating: 4.8,
        text: "This AI-powered chatbot has significantly boosted our customer engagement and sales. It's like having a 24/7 sales assistant.",
        author: "Michael R",
        role: "Marketing Director",
        image: "/testimonials/michael.jpg"
      },
      {
        rating: 5.0,
        text: "The seamless integration with multiple platforms made it easy to reach our customers wherever they are.",
        author: "Sarah T",
        role: "Product Manager",
        image: "/testimonials/sarah.jpg"
      },
      {
        rating: 4.7,
        text: "The AI-driven insights helped us prioritize high-value leads and drive smarter sales strategies. Highly recommended!",
        author: "David K",
        role: "Sales Lead",
        image: "/testimonials/david.jpg"
      },
      {
        rating: 4.9,
        text: "It's amazing how easily the chatbot handles customer queries, recommending products and increasing conversion rates effortlessly.",
        author: "Emily W",
        role: "Customer Success Manager",
        image: "/testimonials/emily.jpg"
      },
      {
        rating: 4.8,
        text: "The ability to switch between AI and human agents has streamlined our support process, making it much more efficient.",
        author: "John H",
        role: "Support Manager",
        image: "/testimonials/john.jpg"
      },
      {
        rating: 5.0,
        text: "We saw instant results with lead prioritization, allowing our sales team to focus on top prospects.",
        author: "Rachel L",
        role: "Sales Executive",
        image: "/testimonials/rachel.jpg"
      }
];

export default function TestimonialSection() {
  return (
    <section className="py-24 mb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateInView>
        <div className="mb-16">
          <span className="text-sm text-neutral-400 font-medium text-center block mb-2">
            FEEDBACK
            </span>
          <h2 className="text-4xl text-center font-medium text-white">What our happy users say!</h2>
        </div>
        </AnimateInView>

        <AnimateInView delay={0.2}>
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={32}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 32,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 32,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 32,
            },
          }}
          className="mySwiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="group bg-white border border-solid border-gray-300 rounded-xl p-6 transition-all duration-500 w-full mx-auto hover:border-indigo-600 hover:shadow-sm slide_active:border-indigo-600">
                <div>
                  <div className="flex items-center mb-7 gap-2 text-amber-500">
                    <svg className="w-5 h-5" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z" fill="currentColor" />
                    </svg>
                    <span className="text-base font-semibold text-indigo-600">{testimonial.rating}</span>
                  </div>
                  <p className="text-base text-gray-600 leading-6 transition-all duration-500 pb-8 group-hover:text-gray-800 slide_active:text-gray-800">
                    {testimonial.text}
                  </p>
                </div>
                <div className="flex items-center gap-5 border-t border-solid border-gray-200 pt-5">
                  <Image className="rounded-full h-10 w-10 object-cover" src={testimonial.image} alt="avatar" width={50} height={50} />
                  <div className="block">
                    <h5 className="text-gray-900 font-medium transition-all duration-500 mb-1">{testimonial.author}</h5>
                    <span className="text-sm leading-4 text-gray-500">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        </AnimateInView>
      </div>
    </section>
  );
}