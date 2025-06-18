import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import SubscriptionStatus from './SubscriptionStatus';

interface DashboardHeaderProps {
  userEmail?: string;
}

const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/')}
            className="hover:bg-muted rounded transition-colors p-1"
          >
            <Logo />
          </button>
          <h1 className="text-xl font-medium text-foreground">InsightsDWS</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <SubscriptionStatus />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/pricing')}
          >
            Pricing
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;