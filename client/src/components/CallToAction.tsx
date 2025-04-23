import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary bg-opacity-10 rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-heading font-bold text-white mb-4">Why Choose Sustainable Travel?</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <i className="fas fa-leaf text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Reduce Your Carbon Footprint</h3>
                    <p className="text-white">Choose eco-friendly transportation options and accommodations that help minimize environmental impact.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <i className="fas fa-globe text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Support Local Communities</h3>
                    <p className="text-white">Discover authentic experiences while contributing to local economies and preserving cultural heritage.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <i className="fas fa-chart-line text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Track Your Impact</h3>
                    <p className="text-white">Monitor your carbon savings and see how your sustainable choices make a difference.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <img 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Sustainable travel experience" 
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
