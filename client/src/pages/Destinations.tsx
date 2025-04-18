import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import DestinationCard from "@/components/DestinationCard";
import { type Destination } from "@shared/schema";

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [carbonFilter, setCarbonFilter] = useState("all");
  
  // Fetch all destinations
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });
  
  // Filter destinations based on search term and carbon filter
  const filteredDestinations = destinations?.filter(destination => {
    const matchesSearch = 
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCarbon = 
      carbonFilter === "all" || 
      (carbonFilter === "low" && destination.carbonScore === 1) ||
      (carbonFilter === "medium" && destination.carbonScore === 2) ||
      (carbonFilter === "high" && destination.carbonScore === 3);
    
    return matchesSearch && matchesCarbon;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-heading font-bold text-neutral-darkest mb-6">Eco-Friendly Destinations</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="search" className="block text-sm font-medium text-neutral-dark mb-1">Search Destinations</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-neutral"></i>
              </div>
              <Input
                id="search"
                type="text"
                placeholder="Search by name, country, or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="carbon-filter" className="block text-sm font-medium text-neutral-dark mb-1">Carbon Impact</label>
            <Select
              value={carbonFilter}
              onValueChange={setCarbonFilter}
            >
              <SelectTrigger id="carbon-filter">
                <SelectValue placeholder="Filter by carbon impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carbon Impacts</SelectItem>
                <SelectItem value="low">Low Carbon Impact</SelectItem>
                <SelectItem value="medium">Medium Carbon Impact</SelectItem>
                <SelectItem value="high">High Carbon Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDestinations?.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-globe text-primary text-5xl mb-4 opacity-50"></i>
          <h3 className="text-xl font-heading font-semibold mb-2">No destinations found</h3>
          <p className="text-neutral-dark">
            Try adjusting your search criteria or explore our featured destinations.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations?.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Destinations;
