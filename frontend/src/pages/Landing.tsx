import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Droplets, Heart, Search, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BloodCompatibilityChart from '@/components/BloodCompatibilityChart';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="bg-gradient-to-br from-blood-700 to-blood-900 text-white py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 blood-drop-bg opacity-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMTAiIHI9IjIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjEwIiByPSIyIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIzMCIgcj0iMiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIyIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSI1MCIgcj0iMiIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iNTAiIHI9IjIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Connecting <span className="text-blood-100 drop-shadow-md">Blood Donors</span> with Lives in Need
              </h1>
              <p className="text-xl mb-8 text-blood-50/90 leading-relaxed">
                RaktSetu bridges the gap between blood donors and hospitals, making the blood donation process seamless, efficient, and life-saving.
              </p>
              
              {/* Quote replacing buttons */}
              <div className="relative py-8 px-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl animate-fade-in my-10 transform hover:scale-105 transition-transform duration-300">
                <blockquote className="text-xl md:text-2xl italic font-medium">
                  <span className="text-5xl leading-none font-serif text-blood-200">"</span>
                  Be the reason someone gets a second chance at life—donate blood.
                  <span className="text-5xl leading-none font-serif text-blood-200">"</span>
                </blockquote>
                <footer className="text-right text-blood-200 mt-4 font-light">— RaktSetu</footer>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-56 h-56 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-40 h-40 bg-blood-100 rounded-full flex items-center justify-center shadow-xl">
                      <div className="relative">
                        <Heart className="h-20 w-20 text-blood-700 animate-pulse" />
                        <Droplets className="h-10 w-10 text-blood-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-pulse-ring opacity-50"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="about" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">How RaktSetu Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our platform simplifies the blood donation process with three easy steps</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blood-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blood-200 transition-colors duration-300 transform group-hover:scale-110">
                      <UserCheck className="h-10 w-10 text-blood-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Register</h3>
                    <p className="text-gray-600 text-lg">
                      Sign up as a donor or hospital. Provide your details including blood type and location.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blood-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blood-200 transition-colors duration-300 transform group-hover:scale-110">
                      <Search className="h-10 w-10 text-blood-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Connect</h3>
                    <p className="text-gray-600 text-lg">
                      Hospitals can search for donors by blood type and location. Donors receive notifications about requests.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blood-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blood-200 transition-colors duration-300 transform group-hover:scale-110">
                      <Heart className="h-10 w-10 text-blood-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Donate</h3>
                    <p className="text-gray-600 text-lg">
                      Accept donation requests, coordinate with hospitals, and save lives through your donation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        


        {/* Compatibility Chart Section */}
        <section id="compatibility" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Blood Compatibility</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Understanding blood types is crucial for successful transfusions. Different blood types have different compatibility rules for donations.
              </p>
            </div>
            
            <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold mb-6 text-blood-700 text-center">Compatibility Chart</h3>
              <BloodCompatibilityChart />
              <div className="mt-8 text-center">
                <p className="text-gray-600 italic">Always consult with healthcare professionals for accurate blood compatibility information.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer onScrollToSection={scrollToSection} />
    </div>
  );
};

export default Landing;
