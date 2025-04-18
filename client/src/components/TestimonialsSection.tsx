const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "EcoTravel helped me plan a cross-country trip that reduced my carbon footprint by 70% compared to flying. The train routes were scenic and the experience was unforgettable.",
      name: "Sarah J.",
      trip: "Norway to Sweden trip",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg"
    },
    {
      quote: "I love how easy it is to see the environmental impact of each travel option. It made me rethink how I travel and now I always choose the greenest option when possible.",
      name: "Michael T.",
      trip: "Costa Rica explorer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "Finding eco-certified accommodations was so simple. My family and I felt good knowing our vacation supported sustainable businesses and local communities.",
      name: "Elena R.",
      trip: "Family trip to New Zealand",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  return (
    <section className="py-12 bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">What Our Eco-Travelers Say</h2>
          <p className="text-lg text-white opacity-80 max-w-3xl mx-auto">
            Join thousands of travelers who are making a difference with every journey.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-accent">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="eco-quote text-neutral-darkest italic mb-4">{testimonial.quote}</p>
              <div className="flex items-center mt-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-600"></i>
                </div>
                <div className="ml-3">
                  <h4 className="font-heading font-medium text-neutral-darkest">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-dark">{testimonial.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
