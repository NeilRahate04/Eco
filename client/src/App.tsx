import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import PlanTrip from "@/pages/PlanTrip";
import Destinations from "@/pages/Destinations";
import MyItineraries from "@/pages/MyItineraries";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/plan-trip" component={PlanTrip} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/my-itineraries" component={MyItineraries} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-neutral-lightest">
          <Navbar />
          <div className="flex-grow">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
