import React from 'react';
import { Heart, Code, Coffee } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/90 backdrop-blur-md border-t border-white/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-gray-600">
            <span>Made with</span>
            <Heart className="text-red-500" size={16} />
            <span>using</span>
            <Code className="text-blue-500" size={16} />
            <span>and</span>
            <Coffee className="text-amber-600" size={16} />
          </div>
          
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Django UMS. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;