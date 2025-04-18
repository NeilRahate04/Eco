const FeaturesSection = () => {
  const features = [
    {
      icon: "leaf",
      title: "Carbon Footprint Tracking",
      description: "Compare the environmental impact of different travel methods and make informed decisions."
    },
    {
      icon: "route",
      title: "Eco-Friendly Routes",
      description: "Discover travel routes that minimize environmental impact while maximizing your experience."
    },
    {
      icon: "building",
      title: "Sustainable Accommodations",
      description: "Find and book lodging options that are committed to sustainable practices."
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-neutral-darkest mb-4">Why Travel with EcoTravel?</h2>
          <p className="text-lg text-neutral-dark max-w-3xl mx-auto">
            Our platform helps you make environmentally conscious travel decisions without sacrificing the experience.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary-light bg-opacity-20 p-3 rounded-full mb-4">
                <i className={`fas fa-${feature.icon} text-primary text-2xl`}></i>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3">{feature.title}</h3>
              <p className="text-neutral-dark">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
