import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Building2, Droplets, Calendar, MessageSquare } from 'lucide-react';

interface DonorSidebarProps {
  className?: string;
}

const DonorSidebar: React.FC<DonorSidebarProps> = ({ className }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/donor/dashboard',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />
    },
    {
      name: 'Profile',
      path: '/donor/profile',
      icon: <Droplets className="h-5 w-5 mr-2" />
    },
    {
      name: 'Blood Camps',
      path: '/donor/blood-camps',
      icon: <Calendar className="h-5 w-5 mr-2" />
    },
    {
      name: 'Find a Hospital',
      path: '/donor/find-hospitals',
      icon: <Building2 className="h-5 w-5 mr-2" />
    },
    {
      name: 'Feedbacks',
      path: '/donor/feedback',
      icon: <MessageSquare className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <div className={cn("flex flex-col space-y-2 p-4 bg-white rounded-lg shadow", className)}>
      <h2 className="font-semibold text-lg mb-4">Donor Menu</h2>
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

export default DonorSidebar;