import { useQuery } from "@tanstack/react-query";
import { getItineraries } from "@/services/itineraryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Calendar, Star } from "lucide-react";

const MyItineraries = () => {
  const { data: itineraries, isLoading, error } = useQuery({
    queryKey: ['/itinerary'],
    queryFn: getItineraries
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading itineraries. Please try again later.
        </div>
      </div>
    );
  }

  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Itineraries Found</h2>
          <p className="text-neutral-dark">
            Start planning your eco-friendly journey by creating a new itinerary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Itineraries</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => (
          <Card key={itinerary._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <span>{itinerary.source.city} → {itinerary.destination.city}</span>
                </div>
                <div className="flex items-center text-sm text-neutral-dark">
                  <Clock className="h-4 w-4 mr-1" />
                  {itinerary.days.length} Days
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-dark">Total Distance:</span>
                  <span className="font-medium">{itinerary.totalDistance.toFixed(1)} km</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Daily Activities:</h3>
                  {itinerary.days.map((day) => (
                    <div key={day.day} className="pl-4 border-l-2 border-primary">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">Day {day.day}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 mr-2 text-green-500" />
                          <span>{day.activity.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 mr-2 text-yellow-500" />
                          <span>{day.lunch.name}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 mr-2 text-blue-500" />
                          <span>{day.hotel.name} (Eco Rating: {day.hotel.eco_rating}/5)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyItineraries; 