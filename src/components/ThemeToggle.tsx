import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-700"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-slate-300" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`cursor-pointer ${theme === 'light' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`cursor-pointer ${theme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`cursor-pointer ${theme === 'system' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
