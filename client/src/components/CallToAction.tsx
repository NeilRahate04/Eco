import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary bg-opacity-10 rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">Ready to Travel Sustainably?</h2>
              <p className="text-neutral-dark mb-6">
                Create an account to start planning your eco-friendly adventures, track your carbon savings, and discover new sustainable destinations.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="inline-flex justify-center items-center px-6 py-3 text-base font-medium">
                  Sign Up Free
                </Button>
                <Button 
                  variant="outline" 
                  className="inline-flex justify-center items-center px-6 py-3 border border-primary text-primary bg-white hover:bg-primary-light hover:bg-opacity-10"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <img 
                src="https://images.unsplash.com/photo-1617653695386-1d78957d33e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Person enjoying sustainable travel experience" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-primary-dark bg-opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
