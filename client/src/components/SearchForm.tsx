import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tripSearchSchema, type TripSearch } from "@shared/mongodb-schema";
import { apiRequest } from "@/lib/queryClient";

interface SearchFormProps {
  onSearchResults: (results: any) => void;
  className?: string;
}

const SearchForm = ({ onSearchResults, className }: SearchFormProps) => {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  
  const form = useForm<TripSearch>({
    resolver: zodResolver(tripSearchSchema),
    defaultValues: {
      fromLocation: "",
      toLocation: "",
      departureDate: new Date(),
    },
  });

  const onSubmit = async (data: TripSearch) => {
    setIsSearching(true);
    try {
      const response = await apiRequest("POST", "/api/trips/search", data);
      onSearchResults(response);
      
      toast({
        title: "Routes found!",
        description: `Found routes from ${data.fromLocation} to ${data.toLocation}`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to search for routes",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl bg-white rounded-lg shadow-xl p-4 md:p-6 ${className || ''}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="fromLocation"
              render={({ field }) => (
                <FormItem className="col-span-3 md:col-span-1">
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter departure location" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="toLocation"
              render={({ field }) => (
                <FormItem className="col-span-3 md:col-span-1">
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter destination" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="col-span-3 md:col-span-1">
                  <FormLabel>Departure Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="date"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" className="mt-4" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SearchForm;
