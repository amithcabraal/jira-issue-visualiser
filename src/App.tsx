import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, HelpCircle, Share2, Settings, Laptop } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { Statistics } from './components/Statistics';
import { NetworkGraph } from './components/NetworkGraph';
import { Filters } from './components/Filters';
import { FilterDebugPanel } from './components/FilterDebugPanel';
import { useJiraStore } from './store';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark' | 'system') || 'system';
  });
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('welcomeDismissed') !== 'true';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const tickets = useJiraStore((state) => state.tickets);

  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeDismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">JIRA Network Analyzer</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <HelpCircle className="w-6 h-6" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Theme</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <Laptop className="w-4 h-4" />
                      <span>System</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md">
            <h2 className="text-2xl font-bold mb-4">Welcome to JIRA Network Analyzer</h2>
            <p className="mb-4">
              This tool helps you analyze JIRA tickets and their relationships. Upload a JSON
              file containing JIRA tickets to:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>View total number of TEG issues</li>
              <li>See tickets linked to non-TEG projects</li>
              <li>Explore ticket relationships in an interactive network map</li>
            </ul>
            <button
              onClick={dismissWelcome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FileUpload />
        
        {tickets.length > 0 && (
          <>
            <div className="mt-8">
              <Statistics />
            </div>
            <div className="mt-8">
              <Filters />
            </div>
            <FilterDebugPanel />
            <div className="mt-8 h-[600px]">
              <NetworkGraph />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;