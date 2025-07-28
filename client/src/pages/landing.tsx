import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Search, 
  Palette, 
  Code, 
  Database, 
  Briefcase, 
  Heart,
  ArrowRight,
  Users,
  CheckCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import ServiceCard from "@/components/service-card";
import type { Service } from "@shared/schema";

export default function Landing() {
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    staleTime: 10 * 60 * 1000,
  });

  const featuredServices = services?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Find the perfect <span className="text-yellow-400">freelance</span> services for your business
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Connect with talented professionals worldwide. From logo design to full development projects.
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-lg p-2 shadow-lg">
                <div className="flex">
                  <Input 
                    className="flex-1 border-none text-gray-900 placeholder-gray-500 focus-visible:ring-0" 
                    placeholder="Try 'logo design' or 'website development'"
                  />
                  <Button className="bg-secondary hover:bg-green-600 px-8">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="mt-6">
                <p className="text-blue-200 mb-3">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {["Logo Design", "Website Design", "Data Entry", "Business Cards"].map((term) => (
                    <Badge key={term} variant="secondary" className="bg-blue-700 hover:bg-blue-600 cursor-pointer">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="animate-fade-in">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional team collaboration" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Services</h2>
            <p className="text-lg text-gray-600">Find the perfect service for your business needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Palette, title: "Design & Creative", desc: "Logo design, banners, flyers, business cards", count: 156, color: "primary" },
              { icon: Code, title: "Web Development", desc: "Websites, apps, e-commerce, UI/UX", count: 89, color: "secondary" },
              { icon: Database, title: "Data Services", desc: "Data entry, analysis, research", count: 67, color: "yellow-500" },
              { icon: Briefcase, title: "Business", desc: "CV design, consulting, marketing", count: 124, color: "purple-600" },
            ].map((category) => (
              <Card key={category.title} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-none">
                <CardContent className="p-6 text-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <div className={`w-16 h-16 bg-${category.color} group-hover:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
                    <category.icon className={`h-8 w-8 text-white group-hover:text-${category.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm opacity-80 mb-4">{category.desc}</p>
                  <div className="text-sm font-medium opacity-90">{category.count} services available</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Services</h2>
              <p className="text-lg text-gray-600">Hand-picked services from our top performers</p>
            </div>
            <Link href="/services">
              <Button variant="ghost" className="text-primary hover:text-primary">
                View All Services <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servicesLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands of Businesses</h2>
            <p className="text-xl text-blue-100">Join our growing community of satisfied clients</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{(stats as any)?.totalServices || 1200}+</div>
              <div className="text-blue-200">Services Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{(stats as any)?.totalUsers || 500}+</div>
              <div className="text-blue-200">Talented Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{(stats as any)?.totalOrders || 15000}+</div>
              <div className="text-blue-200">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-600">Real feedback from real customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "Absolutely perfect! The logo exceeds my expectations. Professional, modern, and exactly what I envisioned. Will definitely work with Alerpa again.",
                name: "John Smith",
                company: "InnovateTech",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
              },
              {
                rating: 5,
                text: "Outstanding data entry service! Fast, accurate, and professional. Saved us hours of work and delivered exactly what we needed.",
                name: "Sarah Johnson",
                company: "TechCorp",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5db?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
              },
              {
                rating: 5,
                text: "Amazing website design! The UI/UX is perfect and really captures our brand. Highly recommend for any web design needs.",
                name: "David Chen",
                company: "E-commerce Plus",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <img 
                      className="w-10 h-10 rounded-full object-cover mr-3" 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-secondary to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of businesses who trust Alerpa for their professional service needs</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-secondary hover:bg-gray-100">
              Start Buying
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-secondary">
              Start Selling
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Alerpa</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                Connect with talented freelancers worldwide and get your projects done efficiently. 
                From creative design to technical development, find the perfect service for your needs.
              </p>
              <div className="flex space-x-4">
                {["facebook-f", "twitter", "linkedin-in", "instagram"].map((social) => (
                  <Button key={social} size="sm" variant="ghost" className="text-gray-300 hover:text-white p-2">
                    <span className="sr-only">{social}</span>
                    {/* Social icons would go here */}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-gray-300">
                {["Logo Design", "Web Development", "Data Entry", "Business Cards", "Banner Design"].map((service) => (
                  <li key={service}>
                    <Link href="/services" className="hover:text-white transition-colors">
                      {service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                {["About Us", "How it Works", "Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">
                © 2024 Alerpa. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-300 text-sm">
                  Made with ❤️ for freelancers worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
