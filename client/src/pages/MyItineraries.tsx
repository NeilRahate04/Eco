import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Leaf, Calendar, Clock, MapPin } from "lucide-react";
import { type Trip } from "@shared/schema";

const MyItineraries = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Fetch user's trips
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
  });
  
  // Mock no trips state since we don't have real user authentication yet
  const hasTrips = false;
  
  // Filter trips by past or upcoming
  const currentDate = new Date();
  const upcomingTrips = trips?.filter(trip => new Date(trip.departureDate) > currentDate);
  const pastTrips = trips?.filter(trip => new Date(trip.departureDate) <= currentDate);
  
  // Dummy trip for UI illustration
  const dummyTrip = {
    id: 1,
    fromLocation: "San Francisco",
    toLocation: "Los Angeles",
    departureDate: new Date("2023-12-15"),
    carbonFootprint: 15,
    duration: 395, // in minutes
    transportType: "train"
  };
  
  if (!hasTrips) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-heading font-bold text-neutral-darkest mb-6">My Itineraries</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="bg-primary-light bg-opacity-20 p-4 rounded-full inline-block mb-4">
            <Calendar className="text-primary text-4xl" />
          </div>
          <h2 className="text-2xl font-heading font-semibold mb-4">No Itineraries Yet</h2>
          <p className="text-neutral-dark mb-6 max-w-md mx-auto">
            You haven't created any travel itineraries yet. Start planning your eco-friendly trips now!
          </p>
          <Button className="px-6 py-3">
            Plan Your First Trip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-heading font-bold text-neutral-darkest mb-6">My Itineraries</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
          <TabsTrigger value="past">Past Trips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Example trip card */}
              <Card className="overflow-hidden">
                <div className="bg-primary-dark py-2 px-4 text-white flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Departure: {dummyTrip.departureDate.toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm flex items-center bg-success bg-opacity-20 px-2 py-1 rounded text-success">
                    <Leaf className="mr-1 h-3 w-3" />
                    Low Carbon Trip
                  </span>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-semibold mb-2">
                        {dummyTrip.fromLocation} to {dummyTrip.toLocation}
                      </h3>
                      <div className="flex space-x-4 text-neutral-dark">
                        <span className="flex items-center">
                          <i className="fas fa-train mr-1"></i> Train
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" /> 
                          {Math.floor(dummyTrip.duration / 60)}h {dummyTrip.duration % 60}m
                        </span>
                        <span className="flex items-center">
                          <Leaf className="mr-1 h-4 w-4" /> 
                          {dummyTrip.carbonFootprint} kg CO2
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit mr-1"></i> Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <i className="fas fa-trash-alt mr-1"></i> Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Add another example card */}
              <Card className="overflow-hidden">
                <div className="bg-primary-dark py-2 px-4 text-white flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Departure: {new Date("2023-12-28").toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm flex items-center bg-warning bg-opacity-20 px-2 py-1 rounded text-warning">
                    <i className="fas fa-bus mr-1"></i>
                    Medium Carbon Trip
                  </span>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-semibold mb-2">
                        New York to Boston
                      </h3>
                      <div className="flex space-x-4 text-neutral-dark">
                        <span className="flex items-center">
                          <i className="fas fa-bus mr-1"></i> Bus
                        </span>
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" /> 
                          4h 15m
                        </span>
                        <span className="flex items-center">
                          <Leaf className="mr-1 h-4 w-4" /> 
                          22 kg CO2
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit mr-1"></i> Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <i className="fas fa-trash-alt mr-1"></i> Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="bg-neutral-dark py-2 px-4 text-white flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Traveled: {new Date("2023-10-05").toLocaleDateString()}</span>
                </div>
                <span className="text-sm flex items-center bg-success bg-opacity-20 px-2 py-1 rounded text-success">
                  <Leaf className="mr-1 h-3 w-3" />
                  Low Carbon Trip
                </span>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">
                      Paris to London
                    </h3>
                    <div className="flex space-x-4 text-neutral-dark">
                      <span className="flex items-center">
                        <i className="fas fa-train mr-1"></i> Train
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" /> 
                        2h 30m
                      </span>
                      <span className="flex items-center">
                        <Leaf className="mr-1 h-4 w-4" /> 
                        8 kg CO2
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="outline" size="sm">
                      <i className="fas fa-copy mr-1"></i> Repeat Trip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyItineraries;
