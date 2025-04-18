import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { Destination } from "@shared/schema";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  
  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  // Format rating from 0-50 to 0-5 with one decimal place
  const formattedRating = (destination.rating / 10).toFixed(1);
  
  return (
    <Card className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={destination.image_url}
          alt={`${destination.name} - ${destination.description}`}
          className="w-full h-48 object-cover"
        />
        {destination.ecoCertified && (
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-primary-light text-primary px-2 py-1 rounded-md text-xs font-medium">
            <i className="fas fa-leaf mr-1"></i> Eco-Certified
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-semibold text-lg text-neutral-darkest">{destination.name}</h3>
          <div className="flex items-center">
            <span className="text-accent-dark font-semibold mr-1">{formattedRating}</span>
            <i className="fas fa-star text-accent-dark text-sm"></i>
          </div>
        </div>
        <p className="text-neutral-dark text-sm mb-3">{destination.description}</p>
        <div className="flex justify-between items-end">
          <div className="flex items-center">
            <div className={`
              flex items-center text-xs px-2 py-1 rounded-md
              ${destination.carbonScore === 1 
                ? 'bg-success bg-opacity-10 text-success' 
                : destination.carbonScore === 2 
                  ? 'bg-warning bg-opacity-10 text-warning' 
                  : 'bg-error bg-opacity-10 text-error'}
            `}>
              <i className={`fas ${destination.carbonScore === 1 ? 'fa-leaf' : 'fa-plane'} mr-1`}></i>
              <span>{destination.carbonImpact}</span>
            </div>
          </div>
          <button 
            className="text-primary hover:text-primary-dark"
            onClick={toggleSave}
          >
            <i className={isSaved ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DestinationCard;
