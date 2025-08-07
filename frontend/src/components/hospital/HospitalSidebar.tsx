import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User, Building2, Droplets, Calendar, MessageSquare, UserSearch } from 'lucide-react';

interface HospitalSidebarProps {
  className?: string;
}

const HospitalSidebar: React.FC<HospitalSidebarProps> = ({ className }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/hospital/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />
    },
    {
      name: 'Profile',
      path: '/hospital/profile',
      icon: <User className="h-5 w-5 mr-2" />
    },
    {
      name: 'Blood Camps',
      path: '/hospital/camps',
      icon: <Calendar className="h-5 w-5 mr-2" />
    },
    {
      name: 'Find a Donor',
      path: '/hospital/find-donors',
      icon: <UserSearch className="h-5 w-5 mr-2" />
    },
    {
      name: 'Feedbacks',
      path: '/hospital/feedback',
      icon: <MessageSquare className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <div className={cn("flex flex-col space-y-2 p-4 bg-white rounded-lg shadow", className)}>
      <h2 className="font-semibold text-lg mb-4">Hospital Menu</h2>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link to={item.path} key={item.path}>
            <Button
              variant={isActive(item.path) ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive(item.path) ? "bg-blood-600 text-white hover:bg-blood-700" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.icon}
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default HospitalSidebar;