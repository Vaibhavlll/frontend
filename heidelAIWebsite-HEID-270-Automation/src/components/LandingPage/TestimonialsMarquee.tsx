import React from 'react';
import { TestimonialsSection } from '@/components/LandingPage/ui/testimonials-with-marquee';

const TestimonialsMarquee = () => {
  const testimonials = [
    {
      author: {
        name: "Sarah Chen",
        handle: "@sarahtech",
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      text: "The AI-powered conversation insights have transformed how we handle customer support. Response times improved by 70% and customer satisfaction is at an all-time high.",
      href: "https://twitter.com/sarahtech"
    },
    {
      author: {
        name: "Marcus Rodriguez",
        handle: "@marcusai",
        avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      text: "Integrating WhatsApp, Instagram, and Facebook in one platform was a game-changer. Our team can now manage all customer conversations seamlessly.",
      href: "https://twitter.com/marcusai"
    },
    {
      author: {
        name: "Emma Thompson",
        handle: "@emmadigital",
        avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      text: "The smart reply suggestions are incredibly accurate. Our agents can respond faster while maintaining a personal touch with every customer interaction."
    },
    {
      author: {
        name: "David Park",
        handle: "@davidbiz",
        avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      text: "Product catalog sync with WhatsApp Business has boosted our sales by 45%. Customers can browse and purchase directly from chat conversations.",
      href: "https://twitter.com/davidbiz"
    },
    {
      author: {
        name: "Lisa Wang",
        handle: "@lisatech",
        avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      text: "The lead analysis feature automatically identifies potential customers. Our conversion rate has increased significantly since implementing this platform."
    },
    {
      author: {
        name: "James Miller",
        handle: "@jamescustomer",
        avatar: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
      },
      text: "Multi-agent support with seamless AI-to-human handoff ensures our customers always get the help they need. The experience is flawless.",
      href: "https://twitter.com/jamescustomer"
    }
  ];

  return (
    <section id="testimonials">
      <TestimonialsSection
        title="What our happy users say!"
        description="Don't just take our word for it. Here's what our customers have to say about their experience with our AI platform."
        testimonials={testimonials}
        className="bg-white sm:-mt-4 mt-6"
      />
    </section>
  );
};

export default TestimonialsMarquee;