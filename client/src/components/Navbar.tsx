import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/plan-trip", label: "Plan Trip", icon: "route" },
    { path: "/destinations", label: "Discover", icon: "globe-americas" },
    { path: "/my-itineraries", label: "My Itineraries", icon: "calendar-alt" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Leaf className="text-primary text-xl mr-2" />
              <span className="font-heading font-bold text-xl text-primary">EcoTravel</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={cn(
                      "border-b-2 text-neutral-dark hover:text-neutral-darkest font-medium text-sm px-1 pt-1 inline-flex items-center",
                      location === item.path
                        ? "border-primary text-neutral-darkest"
                        : "border-transparent hover:border-secondary"
                    )}
                  >
                    <i className={`fas fa-${item.icon} mr-1`}></i> {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <div className="flex-shrink-0">
              <Link href="/saved">
                <a className="text-neutral-dark hover:text-neutral-darkest mr-4 flex items-center">
                  <i className="fas fa-heart mr-1"></i> Saved
                </a>
              </Link>
            </div>
            <div className="ml-3 relative">
              <div>
                <button type="button" className="flex items-center bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                  <i className="fas fa-user-circle mr-1"></i>
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button 
              type="button" 
              className="text-neutral-dark hover:text-neutral-darkest p-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "block pl-3 pr-4 py-2 font-medium",
                  location === item.path
                    ? "bg-primary-light bg-opacity-20 text-primary"
                    : "text-neutral-dark hover:bg-primary-light hover:bg-opacity-10 hover:text-primary"
                )}
              >
                <i className={`fas fa-${item.icon} mr-1`}></i> {item.label}
              </a>
            </Link>
          ))}
          <Link href="/saved">
            <a className="text-neutral-dark hover:bg-primary-light hover:bg-opacity-10 hover:text-primary block pl-3 pr-4 py-2 font-medium">
              <i className="fas fa-heart mr-1"></i> Saved
            </a>
          </Link>
          <div className="pt-2">
            <a href="#" className="block text-center bg-primary text-white px-4 py-2 rounded-md text-sm font-medium mx-3">
              <i className="fas fa-user-circle mr-1"></i> Sign In
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
