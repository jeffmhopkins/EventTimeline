import { useState, useEffect } from "react";
import { Clock, Filter, Volume2, Eye, BarChart3, Moon, X, Database, Palette, Play, Pause, Smartphone, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Check dark mode state when modal opens
  useEffect(() => {
    if (open) {
      const savedDarkMode = localStorage.getItem('darkMode');
      const isDark = savedDarkMode ? JSON.parse(savedDarkMode) : false;
      setDarkMode(isDark);
    }
  }, [open]);

  const modalClasses = darkMode 
    ? "max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700 text-slate-100"
    : "max-w-4xl max-h-[90vh] bg-white border-slate-200 text-slate-900";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalClasses}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>About Event Timeline</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Overview Section */}
            <div>
              <p className={`leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                A dynamic event timeline application that empowers users to manage and track time-sensitive events with precision. Features comprehensive Progressive Web App (PWA) capabilities and runs entirely in your browser without external dependencies.
              </p>
            </div>

            {/* How It Works Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">1</div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Set your main event time as the reference point for all other events</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">2</div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Add events with time offsets before the main event (e.g., "Setup - 30 minutes before")</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">3</div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Watch events transition from upcoming (gray) to imminent (yellow) to completed (blue/green)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">4</div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Use filtering, notifications, and pause controls to manage your timeline effectively</p>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Key Features</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Real-Time Countdowns</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Precise synchronized timing with customizable main event scheduling</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Palette className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Smart Status Transitions</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Color-coded event states with adjustable imminent thresholds (1-60s)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Progress Timeline Bar</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Visual timeline with event dots and real-time progress tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Imminent Blink Alerts</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Yellow flash notifications for events approaching completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Pause className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Timeline Control</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Pause/resume functionality for timeline review and manual navigation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Filter className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Dynamic Category System</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Auto-generated categories with random color assignments and filtering</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Data Management</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>CSV import/export, local caching, and random event generation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Auto-Scroll Navigation</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Intelligent positioning of completed events with pause-aware controls</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Volume2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Audio & Visual Alerts</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sound notifications and screen flash effects for event completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Moon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Dark Mode Default</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Complete dark theme with light mode toggle option</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>PWA Installation</h4>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Install as Progressive Web App on Chrome devices and home screens</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Privacy Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Privacy & Local Data</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                This application runs entirely in your browser with complete data privacy. All event information is stored locally using browser storage 
                and never transmitted to external servers. Optional local caching preserves your timeline data between browser sessions. 
                The app works fully offline and maintains complete user control over all data.
              </p>
            </div>

            {/* Technology Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Built With</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-xs">
                  <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>React</div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Frontend framework</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>TypeScript</div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Type safety</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Tailwind CSS</div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Styling</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Vite</div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Build tool</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Lucide React</div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Icons</div>
                </div>
                <div className="text-xs">
                  <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>shadcn/ui</div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-600'}>UI components</div>
                </div>
              </div>
            </div>

            {/* Creator Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Created By</h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Event Timeline was created by <span className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Jeff Hopkins</span>. 
                This Progressive Web App provides precise event timing and coordination for time-critical scenarios with comprehensive visual feedback, 
                customizable notifications, and complete offline functionality.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}