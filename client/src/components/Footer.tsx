import { Link } from "wouter";
import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-darkest py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Leaf className="text-primary text-xl mr-2" />
              <span className="font-heading font-bold text-xl text-white">EcoTravel</span>
            </div>
            <p className="text-neutral-light mb-4">Making sustainable travel accessible to everyone.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral hover:text-white transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral hover:text-white transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-neutral hover:text-white transition-colors">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-heading font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/destinations" 
                  className="text-neutral-light hover:text-white transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link 
                  href="/plan-trip" 
                  className="text-neutral-light hover:text-white transition-colors"
                >
                  Transportation
                </Link>
              </li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Accommodations</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Experiences</a></li>
              <li>
                <Link 
                  href="/plan-trip" 
                  className="text-neutral-light hover:text-white transition-colors"
                >
                  Carbon Calculator
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-heading font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Partners</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-heading font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-light hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-dark mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-light text-sm mb-4 md:mb-0">© {new Date().getFullYear()} EcoTravel. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-light hover:text-white text-sm transition-colors">Privacy</a>
            <a href="#" className="text-neutral-light hover:text-white text-sm transition-colors">Terms</a>
            <a href="#" className="text-neutral-light hover:text-white text-sm transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
