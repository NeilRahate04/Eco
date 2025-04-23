import { useState } from 'react';
import { Link } from 'wouter';
import { Destination } from '@shared/mongodb-schema';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save functionality
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/destinations/${destination._id}`}>
        <div className="cursor-pointer">
          <img
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{destination.name}</h3>
            <p className="text-gray-600 mb-2">{destination.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">
                  {formatRating(destination.rating)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className={isSaved ? 'text-red-500' : 'text-gray-400'}
              >
                <Heart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DestinationCard;
