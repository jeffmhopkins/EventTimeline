import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Filter, Play, Pause, Volume2, Eye, BarChart3, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode setting from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timeline
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">About Event Timeline</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">A dynamic timeline application for managing and tracking time-sensitive events</p>
        </div>

        <div className="space-y-8">
          {/* Overview Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Event Timeline is a precision-focused application designed to help you track and manage events relative to a main event. 
              Whether you're coordinating a product launch, managing a conference schedule, or tracking project milestones, 
              this tool provides real-time countdown functionality with visual status indicators.
            </p>
          </div>

          {/* Key Features Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Real-time Countdowns</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Live countdown timers showing precise time remaining for each event</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Category Filtering</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Filter events by category to focus on specific types of activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Status Indicators</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Color-coded status showing completed, upcoming, and imminent events</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Pause className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Pause & Resume</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pause the timeline to review events without losing track of time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Audio Notifications</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Optional sound alerts when events complete</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Visual Effects</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Screen blink notifications and auto-scroll to completed events</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Progress Timeline</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Visual timeline bar showing event positions and overall progress</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">Dark Mode</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Complete dark theme support for comfortable viewing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">URL Import</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Load events directly from CSV files using URL parameters for easy sharing</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</div>
                <p className="text-slate-600 dark:text-slate-400">Set your main event time - this serves as the reference point for all other events</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</div>
                <p className="text-slate-600 dark:text-slate-400">Add events with time offsets before the main event (e.g., "Setup - 30 minutes before")</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</div>
                <p className="text-slate-600 dark:text-slate-400">Watch as events transition from upcoming (gray) to imminent (yellow) to completed (blue/green)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">4</div>
                <p className="text-slate-600 dark:text-slate-400">Use filtering, notifications, and pause controls to manage your timeline effectively</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">5</div>
                <p className="text-slate-600 dark:text-slate-400">Share timelines by adding <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">?events=csv-url</code> to load events from external CSV files</p>
              </div>
            </div>
          </div>

          {/* Data & Privacy Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Data & Privacy</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              All event data is stored locally in your browser using localStorage. No data is sent to external servers, 
              ensuring complete privacy and control over your timeline information. The application works entirely offline 
              once loaded, making it reliable for time-critical scenarios.
            </p>
          </div>

          {/* Technology Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Built With</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-200">React</div>
                <div className="text-slate-600 dark:text-slate-400">Frontend framework</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-200">TypeScript</div>
                <div className="text-slate-600 dark:text-slate-400">Type safety</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-200">Tailwind CSS</div>
                <div className="text-slate-600 dark:text-slate-400">Styling</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-200">Vite</div>
                <div className="text-slate-600 dark:text-slate-400">Build tool</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-200">Lucide React</div>
                <div className="text-slate-600 dark:text-slate-400">Icons</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 dark:text-slate-200">shadcn/ui</div>
                <div className="text-slate-600 dark:text-slate-400">UI components</div>
              </div>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Created By</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Event Timeline was created by <span className="font-semibold text-slate-800 dark:text-slate-200">Jeff Hopkins</span>, 
              designed to provide precise event timing and coordination for time-critical scenarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}