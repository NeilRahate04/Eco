import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { tripSearchSchema, type TripSearch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface SearchFormProps {
  onSearchResults?: (results: any) => void;
  className?: string;
}

const SearchForm = ({ onSearchResults, className }: SearchFormProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const form = useForm<TripSearch>({
    resolver: zodResolver(tripSearchSchema),
    defaultValues: {
      from: "",
      to: "",
      when: new Date().toISOString().split('T')[0],
      ecoPriority: false
    }
  });

  const onSubmit = async (data: TripSearch) => {
    setIsSearching(true);
    try {
      const response = await apiRequest("POST", "/api/trip-search", data);
      const results = await response.json();
      
      if (onSearchResults) {
        onSearchResults(results);
      }
      
      toast({
        title: "Routes found!",
        description: `Found routes from ${data.from} to ${data.to}`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to search for routes",
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
              name="from"
              render={({ field }) => (
                <FormItem className="col-span-3 md:col-span-1">
                  <FormLabel className="text-neutral-darkest text-sm font-medium">From</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-map-marker-alt text-neutral"></i>
                      </div>
                      <Input 
                        placeholder="Your location" 
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
              name="to"
              render={({ field }) => (
                <FormItem className="col-span-3 md:col-span-1">
                  <FormLabel className="text-neutral-darkest text-sm font-medium">To</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-map-marker text-neutral"></i>
                      </div>
                      <Input 
                        placeholder="Destination" 
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
              name="when"
              render={({ field }) => (
                <FormItem className="col-span-3 md:col-span-1">
                  <FormLabel className="text-neutral-darkest text-sm font-medium">When</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-calendar text-neutral"></i>
                      </div>
                      <Input 
                        type="date" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1">
                <FormField
                  control={form.control}
                  name="ecoPriority"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 mb-2 sm:mb-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-neutral-dark">
                        Prioritize lowest carbon footprint
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="inline-flex justify-center items-center px-6 py-3 text-base font-medium rounded-md w-full sm:w-auto"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-search mr-2"></i>
                  )}
                  Find Routes
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SearchForm;
