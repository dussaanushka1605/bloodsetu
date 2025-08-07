
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface FooterProps {
  onScrollToSection?: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onScrollToSection }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (isLandingPage && onScrollToSection) {
      onScrollToSection(id);
    } else {
      navigate('/');
      // Adding a small timeout to ensure navigation completes before scrolling
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">RaktSetu</h3>
            <p className="text-gray-600 text-sm">
              Connecting blood donors with hospitals and patients in need, 
              making blood donation more accessible and efficient.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/#home" 
                  className="text-sm text-gray-600 hover:text-blood-600"
                  onClick={(e) => handleClick(e, 'home')}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/#about" 
                  className="text-sm text-gray-600 hover:text-blood-600"
                  onClick={(e) => handleClick(e, 'about')}
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/#compatibility" 
                  className="text-sm text-gray-600 hover:text-blood-600"
                  onClick={(e) => handleClick(e, 'compatibility')}
                >
                  Blood Compatibility
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-600 hover:text-blood-600">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-600 hover:text-blood-600">
                  Register
                </Link>
              </li>

            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} RaktSetu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
