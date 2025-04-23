import { Link } from "wouter";
import FeaturesSection from "@/components/FeaturesSection";
import DestinationCard from "@/components/DestinationCard";
import CarbonCalculator from "@/components/CarbonCalculator";
import TestimonialsSection from "@/components/TestimonialsSection";
import CallToAction from "@/components/CallToAction";
import { useQuery } from "@tanstack/react-query";
import { type Destination } from "@shared/mongodb-schema";

const Home = () => {
  // Fetch popular destinations
  const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[]>({
    queryKey: ['/destinations'],
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-primary-dark text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Scenic mountain landscape with sustainable travel" 
            className="w-full h-full object-cover" 
            style={{ opacity: 0.7 }}
          />
          <div className="absolute inset-0 bg-primary-dark bg-opacity-60"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8 flex flex-col items-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-center mb-6">
            <span className="text-black">Travel Sustainably.</span><br />
            <span className="text-secondary-light">Explore Responsibly.</span>
          </h1>
          <p className="text-lg md:text-xl text-center max-w-2xl mb-8">
            Discover eco-friendly destinations and plan trips that minimize your carbon footprint while maximizing your experience.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection />
      
      {/* Popular Destinations */}
      <section className="py-12 bg-neutral-lightest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-neutral-darkest">Eco-Friendly Destinations</h2>
            <Link 
              href="/destinations"
              className="text-primary hover:text-primary-dark font-medium inline-flex items-center"
            >
              View all <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingDestinations ? (
              // Loading state
              Array(3).fill(0).map((_, index) => (
                <div key={`loading-${index}`} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              ))
            ) : (
              // Display destinations
              destinations?.slice(0, 3).map((destination) => (
                <DestinationCard 
                  key={`destination-${destination._id}`} 
                  destination={destination} 
                />
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Carbon Calculator Demo */}
      <CarbonCalculator />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default Home;
