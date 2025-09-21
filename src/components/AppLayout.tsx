import { useState } from "react";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import {
  Home,
  Heart,
  MessageCircle,
  Settings,
  TrendingUp,
  User,
  LogOut,
  Bell,
  Sparkles
} from "lucide-react";

const navigation = [
  { name: "Chat", url: "/chat", icon: MessageCircle },
  { name: "Paqueras", url: "/crushes", icon: Heart },
  { name: "Insights", url: "/insights", icon: TrendingUp },
  { name: "Perfil", url: "/personalization", icon: Sparkles },
];

const AppLayout = () => {
  const { signOut, user } = useAuth();
  const { profile } = useDashboard();
  const navigate = useNavigate();
  const [notifications] = useState(3); // Mock notification count

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'US';
  };

  const getDisplayName = () => {
    return profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  const getDisplayEmail = () => {
    return profile?.email || user?.email || '';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-background relative">
        {/* Tubelight Navigation */}
        <NavBar items={navigation} />
        
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">Crystal.ai</span>
            </div>

            <div className="flex items-center gap-4">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="Avatar" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getDisplayEmail()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-20 sm:pt-4 pb-20 sm:pb-4 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/5548968770906"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50 flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Crystal WhatsApp</span>
        </a>
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;