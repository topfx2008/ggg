import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart } from "lucide-react";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  viewMode?: "grid" | "list";
}

export default function ServiceCard({ service, viewMode = "grid" }: ServiceCardProps) {
  const categoryColors: Record<string, string> = {
    design: "bg-primary text-white",
    development: "bg-secondary text-white", 
    data: "bg-accent text-white",
    business: "bg-purple-600 text-white",
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex space-x-6">
            <div className="relative">
              <img
                src={service.featuredImage || "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"}
                alt={service.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1 h-8 w-8"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Badge className={categoryColors[service.category] || "bg-gray-600 text-white"}>
                  {service.category}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">4.9</span>
                  <span className="text-sm text-gray-500 ml-1">(127)</span>
                </div>
              </div>
              
              <Link href={`/services/${service.slug}`}>
                <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors mb-2 line-clamp-2">
                  {service.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.shortDescription}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">S</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">Seller</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">${service.price}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        <img
          src={service.featuredImage || "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
          alt={service.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md p-2 h-8 w-8"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback className="text-xs">S</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 font-medium">Seller</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">4.9</span>
            <span className="text-sm text-gray-500 ml-1">(127)</span>
          </div>
        </div>
        
        <Link href={`/services/${service.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors mb-2 line-clamp-2">
            {service.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <Badge className={categoryColors[service.category] || "bg-gray-600 text-white"}>
            {service.category}
          </Badge>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">${service.price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
