import { useState, useEffect, useRef } from "react";
import { Clock, Filter, Volume2, Eye, BarChart3, Moon, X, Database, Palette, Play, Pause, Smartphone, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  // Directly check dark mode without state to prevent flashing
  const isDarkMode = document.documentElement.classList.contains('dark');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showMoreIndicator, setShowMoreIndicator] = useState(false);

  const modalClasses = isDarkMode 
    ? "max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700 text-slate-100"
    : "max-w-4xl max-h-[90vh] bg-white border-slate-200 text-slate-900";

  // Check if content is scrollable and update indicator visibility
  useEffect(() => {
    const checkScrollable = () => {
      const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        const isScrollable = scrollElement.scrollHeight > scrollElement.clientHeight;
        const isAtBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 5;

        setShowMoreIndicator(isScrollable && !isAtBottom);
      }
    };

    // Add delay to ensure ScrollArea is fully rendered
    const timer = setTimeout(() => {
      const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.addEventListener('scroll', checkScrollable);
        checkScrollable(); // Initial check
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', checkScrollable);
      }
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={modalClasses}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>About Event Timeline</DialogTitle>
          <DialogDescription className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            A dynamic event timeline application for managing and tracking time-sensitive events with precision
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <ScrollArea ref={scrollAreaRef} className="h-[70vh] pr-4">
            <div className="space-y-6">

            {/* How It Works Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">1</div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Set your main event time as the reference point for all other events</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">2</div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Add events with time offsets before or after the main event (e.g., "Setup - 30 minutes before" or "Cleanup + 15 minutes after")</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">3</div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Watch events transition from upcoming (gray) to imminent (yellow) to completed (blue/green)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">4</div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Use filtering, notifications, and pause controls to manage your timeline effectively</p>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Key Features</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Enhanced Time Management</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Supports events before AND after main event with intuitive timing selection in add/edit forms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Palette className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Smart Status Transitions</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Color-coded event states with adjustable imminent thresholds (1-60s)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Progress Timeline Bar</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Visual timeline with event dots and real-time progress tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Imminent Blink Alerts</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Yellow flash notifications for events approaching completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Pause className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Timeline Control</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pause/resume functionality for timeline review and manual navigation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Dynamic Phase Tracking</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Header title automatically updates to show the most recent completed "phase" event, providing real-time progress indication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Advanced Data Management</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>CSV import/export with proper time offset handling and local caching for data persistence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Auto-Scroll Navigation</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Intelligent positioning of completed events with pause-aware controls</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Volume2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Audio & Visual Alerts</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sound notifications and screen flash effects for event completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Moon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Dark Mode Default</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Complete dark theme with light mode toggle option</p>
                  </div>
                </div>

              </div>
            </div>

            {/* URL Import Feature Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>URL Import Feature</h3>
              <div className="space-y-3">
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Share and import event timelines instantly using URL parameters. This feature allows for seamless collaboration and quick setup of predefined event schedules.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>How to Use URL Import:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">1</div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Add <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">?events=URL</code> to your timeline URL</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">2</div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>The app will automatically fetch and import events from the provided CSV URL</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">3</div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Events are imported once and cached locally - reload to re-import</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Example Usage:</h4>
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
                      <code className={`text-xs font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        https://your-timeline.com/?events=https://example.com/timeline.csv
                      </code>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Data & Privacy Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Privacy & Local Data</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                This application runs entirely in your browser with complete data privacy. All event information is stored locally using browser storage 
                and never transmitted to external servers. Optional local caching preserves your timeline data between browser sessions. 
                The app works fully offline and maintains complete user control over all data. URL imports are fetched client-side and cached locally.
              </p>
            </div>

            {/* Technology Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Built With</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-xs">
                  <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>React</div>
                  <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Frontend framework</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>TypeScript</div>
                  <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Type safety</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Tailwind CSS</div>
                  <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Styling</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Vite</div>
                  <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Build tool</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Lucide React</div>
                  <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Icons</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>shadcn/ui</div>
                  <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>UI components</div>
                </div>
              </div>
            </div>

            {/* Creator Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Created By</h3>
              <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Event Timeline was created by <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Jeff Hopkins</span>. 
                This Progressive Web App provides precise event timing and coordination for time-critical scenarios with comprehensive visual feedback, 
                customizable notifications, and complete offline functionality.
              </p>
              <div className="space-y-2">
                <div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>GitHub Project: </span>
                  <a 
                    href="https://github.com/jeffmhopkins/EventTimeline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-sm underline hover:no-underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    https://github.com/jeffmhopkins/EventTimeline
                  </a>
                </div>

              </div>
            </div>

            {/* Version Info */}
            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Event Timeline, v1.0.5
              </p>
            </div>
            </div>
          </ScrollArea>
          
          {/* Down arrow indicator */}
          {showMoreIndicator && (
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-10"
              style={{ bottom: '-12px', backgroundColor: 'rgba(148,163,184,0.4)', borderRadius: '50%', padding: '4px' }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M7 10L12 15L17 10" 
                  stroke="#000000" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}