import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Trash2, ArrowDown, Filter, Clock, Play, Pause, ChevronDown, Check, Download, Copy, Upload, Volume2, Zap, Moon, Sun, Info, Target, HelpCircle, Save, Palette } from "lucide-react";
import { AboutModal } from "@/components/about-modal";
import { MainEventDialog } from "@/components/main-event-dialog";
import { MenuToggle } from "@/components/menu-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { getCategoryColor } from "@/lib/event-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Event } from "@shared/schema";

interface EventHeaderProps {
  onGenerateEvents: () => void;
  onDeleteAllEvents: () => void;
  autoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onSelectAllCategories: () => void;
  onSelectNoneCategories: () => void;
  availableCategories: string[];
  selectedStatuses: string[];
  onStatusToggle: (status: string) => void;
  onSelectAllStatuses: () => void;
  onSelectNoneStatuses: () => void;
  onSetMainEventTime: (timestamp: number) => void;
  onUpdateMainEventTitle: (title: string) => void;
  onUpdateMainEventDescription: (description: string) => void;
  mainEventTime?: number;
  mainEvent?: Event | null;
  mainEventDescription?: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onAddEvent: (newEvent: { title: string; description: string; category: string; timeToEvent: number }) => void;
  onImportEvents: (events: { title: string; description: string; category: string; timeToEvent: number }[]) => void;
  events: Event[];
  audioNotificationsEnabled: boolean;
  onToggleAudioNotifications: () => void;
  blinkEnabled: boolean;
  onToggleBlink: () => void;
  progressBarEnabled: boolean;
  onToggleProgressBar: () => void;
  progressBarHistoryLength: number;
  onSetProgressBarHistoryLength: (seconds: number) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  imminentThreshold: number;
  onSetImminentThreshold: (seconds: number) => void;
  imminentBlinkEnabled: boolean;
  onToggleImminentBlink: () => void;
  globalTime: number;
  cacheDataLocally: boolean;
  onToggleCacheData: () => void;
  triggerImport?: boolean;
  onImportTriggered?: () => void;
  dynamicHeaderTitle?: string | null;
}

export function EventHeader({ onGenerateEvents, onDeleteAllEvents, autoScrollEnabled, onToggleAutoScroll, selectedCategories, onCategoryToggle, onSelectAllCategories, onSelectNoneCategories, availableCategories, selectedStatuses, onStatusToggle, onSelectAllStatuses, onSelectNoneStatuses, onSetMainEventTime, onUpdateMainEventTitle, onUpdateMainEventDescription, mainEventDescription, mainEventTime, mainEvent, isPaused, onTogglePause, onAddEvent, onImportEvents, events, audioNotificationsEnabled, onToggleAudioNotifications, blinkEnabled, onToggleBlink, progressBarEnabled, onToggleProgressBar, progressBarHistoryLength, onSetProgressBarHistoryLength, darkMode, onToggleDarkMode, imminentThreshold, onSetImminentThreshold, imminentBlinkEnabled, onToggleImminentBlink, globalTime, cacheDataLocally, onToggleCacheData, triggerImport, onImportTriggered, dynamicHeaderTitle }: EventHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearchValue, setCategorySearchValue] = useState('');
  const [isImminentDialogOpen, setIsImminentDialogOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(imminentThreshold);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [tempHistoryLength, setTempHistoryLength] = useState(progressBarHistoryLength);
  const [addEventForm, setAddEventForm] = useState({
    title: '',
    description: '',
    category: '',
    hours: 0,
    minutes: 1,
    seconds: 0,
    timing: 'before' // 'before' or 'after' main event
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [mainEventTitle, setMainEventTitle] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importCsvData, setImportCsvData] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [animationOffset, setAnimationOffset] = useState(0);

  // Check if title needs marquee scrolling only when title changes
  useEffect(() => {
    // Reset marquee state first
    setNeedsMarquee(false);
    setAnimationOffset(0);
    
    const checkOverflow = () => {
      if (titleRef.current) {
        const titleElement = titleRef.current;
        const titleContainer = titleElement.parentElement;
        if (titleContainer) {
          const titleWidth = titleElement.scrollWidth;
          const containerWidth = titleContainer.clientWidth;
          
          const shouldMarquee = titleWidth > containerWidth;
          setNeedsMarquee(shouldMarquee);
        }
      }
    };

    // Check after DOM updates
    const timeoutId = setTimeout(checkOverflow, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [dynamicHeaderTitle]);



  // Separate effect for window resize
  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const titleElement = titleRef.current;
        const titleContainer = titleElement.parentElement;
        if (titleContainer) {
          const titleWidth = titleElement.scrollWidth;
          const containerWidth = titleContainer.clientWidth;
          setNeedsMarquee(titleWidth > containerWidth);
        }
      }
    };

    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  // JavaScript-based animation for marquee
  useEffect(() => {
    let animationId: number;
    
    if (needsMarquee) {
      const animate = () => {
        setAnimationOffset(prev => {
          const newOffset = prev - 0.27;
          // Reset when the first copy has completely scrolled out
          // Since we have 3 copies, reset when we've scrolled about 1/3 of the total width
          if (titleRef.current) {
            const resetPoint = -(titleRef.current.scrollWidth / 3);
            return newOffset < resetPoint ? 0 : newOffset;
          }
          return newOffset < -200 ? 0 : newOffset;
        });
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    } else {
      // Reset position when marquee stops
      setAnimationOffset(0);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [needsMarquee]);

  // Create styled title component
  const renderStyledTitle = () => {
    const displayTitle = dynamicHeaderTitle || (mainEvent ? mainEvent.title : "Event Timeline");
    
    // Check if title contains a phase (has " - " separator)
    const phaseSeparatorIndex = displayTitle.indexOf(' - ');
    
    const styledContent = phaseSeparatorIndex !== -1 ? (
      <span>
        {displayTitle.substring(0, phaseSeparatorIndex)}
        <span className="text-slate-600 dark:text-slate-400"> - {displayTitle.substring(phaseSeparatorIndex + 3)}</span>
      </span>
    ) : displayTitle;
    
    // For marquee, duplicate the content with spacing
    if (needsMarquee) {
      return (
        <span>
          {styledContent}
          <span className="text-slate-600 dark:text-slate-400"> - </span>
          {styledContent}
          <span className="text-slate-600 dark:text-slate-400"> - </span>
          {styledContent}
        </span>
      );
    }
    
    return styledContent;
  };

  const handleGenerateClick = () => {
    onGenerateEvents();
    setIsOpen(false);
  };

  const handleDeleteAllClick = () => {
    onDeleteAllEvents();
    setIsOpen(false);
  };

  const handleSetMainEventTime = () => {
    if (selectedDate && selectedTime) {
      const dateTimeString = `${selectedDate}T${selectedTime}`;
      const timestamp = new Date(dateTimeString).getTime();
      onSetMainEventTime(timestamp);
      
      if (mainEventTitle.trim()) {
        onUpdateMainEventTitle(mainEventTitle.trim());
      }
      
      setIsTimeDialogOpen(false);
      setSelectedDate('');
      setSelectedTime('');
      setMainEventTitle('');
    }
  };

  const handleOpenTimeDialog = () => {
    // Initialize with current main event time or current time
    const currentTimestamp = mainEventTime || Date.now();
    const date = new Date(currentTimestamp);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    setSelectedDate(`${year}-${month}-${day}`);
    setSelectedTime(`${hours}:${minutes}:${seconds}`);
    setMainEventTitle(mainEvent?.title || '');
    setIsTimeDialogOpen(true);
    setIsOpen(false);
  };

  const handleOpenAddEventDialog = () => {
    // Determine default category based on priority:
    // 1. Last added event category (excluding main event)
    // 2. Last completed event category  
    // 3. First event category
    // 4. Default to 'Milestone'
    let defaultCategory = 'Milestone';
    
    // Filter out main event from events list - only consider timeline events
    const timelineEvents = events.filter(event => event.timeToEvent !== 0);
    
    if (timelineEvents.length > 0) {
      // Sort events by creation order (assuming events are added chronologically)
      const sortedEvents = [...timelineEvents].sort((a, b) => a.id.localeCompare(b.id));
      const lastAddedEvent = sortedEvents[sortedEvents.length - 1];
      
      if (lastAddedEvent) {
        defaultCategory = lastAddedEvent.category;
      } else {
        // Find last completed event
        const currentTime = globalTime;
        const completedEvents = timelineEvents.filter(event => {
          const eventTime = mainEventTime ? mainEventTime + (event.timeToEvent * 1000) : 0;
          return currentTime >= eventTime;
        }).sort((a, b) => {
          const aTime = mainEventTime ? mainEventTime + (a.timeToEvent * 1000) : 0;
          const bTime = mainEventTime ? mainEventTime + (b.timeToEvent * 1000) : 0;
          return bTime - aTime; // Sort by most recently completed
        });
        
        if (completedEvents.length > 0) {
          defaultCategory = completedEvents[0].category;
        } else {
          // Use first event category
          defaultCategory = timelineEvents[0].category;
        }
      }
    }

    // Calculate current time difference from main event
    if (mainEventTime) {
      const currentTime = globalTime;
      const timeDiff = Math.abs(mainEventTime - currentTime);
      const isBeforeMainEvent = currentTime < mainEventTime;
      
      // Convert milliseconds to hours, minutes, seconds
      const totalSeconds = Math.floor(timeDiff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Pre-populate form with current countdown time and default category
      setAddEventForm({
        title: '',
        description: '',
        category: defaultCategory,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        timing: isBeforeMainEvent ? 'before' : 'after'
      });
    } else {
      // Default values if no main event is set
      setAddEventForm({
        title: '',
        description: '',
        category: defaultCategory,
        hours: 0,
        minutes: 1,
        seconds: 0,
        timing: 'before'
      });
    }
    
    setIsAddEventOpen(true);
    setIsOpen(false);
  };

  const handleAddEventSubmit = () => {
    if (addEventForm.title.trim() && addEventForm.description.trim() && addEventForm.category.trim()) {
      const totalSeconds = (addEventForm.hours * 3600) + (addEventForm.minutes * 60) + addEventForm.seconds;
      
      // Use positive for "after" and negative for "before" main event
      const timeToEvent = addEventForm.timing === 'after' ? totalSeconds : -totalSeconds;
      
      onAddEvent({
        title: addEventForm.title.trim(),
        description: addEventForm.description.trim(),
        category: addEventForm.category.trim(),
        timeToEvent: timeToEvent
      });
      
      // Reset form
      setAddEventForm({
        title: '',
        description: '',
        category: '',
        hours: 0,
        minutes: 1,
        seconds: 0,
        timing: 'before'
      });
      setIsAddEventOpen(false);
    }
  };

  const handleImminentThresholdSave = () => {
    const threshold = Math.max(1, Math.min(60, tempThreshold));
    onSetImminentThreshold(threshold);
    setIsImminentDialogOpen(false);
  };

  const handleOpenImminentDialog = () => {
    setTempThreshold(imminentThreshold);
    setIsImminentDialogOpen(true);
    setIsOpen(false);
  };

  const handleHistoryLengthSave = () => {
    const historyLength = Math.max(0, tempHistoryLength);
    onSetProgressBarHistoryLength(historyLength);
    setIsHistoryDialogOpen(false);
  };

  const handleOpenHistoryDialog = () => {
    setTempHistoryLength(progressBarHistoryLength);
    setIsHistoryDialogOpen(true);
    setIsOpen(false);
  };

  // Get categories dynamically from existing events (excluding main event)
  const availableEventCategories = Array.from(new Set(events.filter(event => event.category !== '' && event.timeToEvent !== 0).map(event => event.category)));

  const generateCSV = () => {
    const header = 'Seconds to Main Event,Title,Description,Category\n';
    const rows = events
      .sort((a, b) => a.timeToEvent - b.timeToEvent) // Sort by time to event (ascending, since negative values)
      .map(event => {
        // Escape quotes and wrap fields in quotes if they contain commas or quotes
        const escapeCSV = (field: string) => {
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        };
        
        // For main event (timeToEvent === 0), use category field as the timestamp
        const categoryValue = event.timeToEvent === 0 ? event.category : event.category;
        
        return `${event.timeToEvent},${escapeCSV(event.title)},${escapeCSV(event.description)},${escapeCSV(categoryValue)}`;
      })
      .join('\n');
    
    return header + rows;
  };

  const handleExportCSV = () => {
    const csv = generateCSV();
    setCsvData(csv);
    setIsExportOpen(true);
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(csvData);
      // Could add a toast notification here if desired
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = csvData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleImportCSV = () => {
    setImportCsvData('');
    setIsImportOpen(true);
    setIsOpen(false);
  };

  // Handle external trigger for import modal
  useEffect(() => {
    if (triggerImport) {
      handleImportCSV();
      onImportTriggered?.();
    }
  }, [triggerImport, onImportTriggered]);



  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const events: { title: string; description: string; category: string; timeToEvent: number }[] = [];
    let mainEventData: { title: string; description: string; timestamp?: number } | null = null;
    
    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes('seconds') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      if (values.length >= 4) {
        const timeToEvent = parseInt(values[0]);
        if (!isNaN(timeToEvent)) {
          if (timeToEvent === 0) {
            // This is main event data - parse HH:MM:SS time format from category field
            const timeStr = values[3].trim();
            const parseTimeString = (timeStr: string) => {
              const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
              if (timeMatch) {
                const [, hours, minutes, seconds] = timeMatch;
                const today = new Date();
                today.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
                return today.getTime();
              }
              return null;
            };
            
            const timestamp = parseTimeString(timeStr);
            mainEventData = {
              title: values[1].trim(),
              description: values[2].trim(),
              ...(timestamp && { timestamp })
            };
          } else {
            // Regular event
            events.push({
              timeToEvent: timeToEvent, // Preserve original sign (negative = before, positive = after)
              title: values[1].trim(),
              description: values[2].trim(),
              category: values[3].trim()
            });
          }
        }
      }
    }
    
    return { events, mainEventData };
  };

  const parseCSVLine = (line: string) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    values.push(current);
    return values;
  };

  const handleImportSubmit = () => {
    if (importCsvData.trim()) {
      try {
        const parseResult = parseCSV(importCsvData);
        const events = parseResult.events;
        const mainEventData = parseResult.mainEventData;
        
        // Update main event if we found 0s data
        if (mainEventData) {
          onUpdateMainEventTitle(mainEventData.title);
          onUpdateMainEventDescription(mainEventData.description);
          // If timestamp is provided, update the main event time
          if ('timestamp' in mainEventData && mainEventData.timestamp) {
            onSetMainEventTime(mainEventData.timestamp);
          }
        }
        
        // Import the regular events
        if (events.length > 0) {
          onImportEvents(events);
        }
        
        // Close dialog if we imported anything
        if (events.length > 0 || mainEventData) {
          setImportCsvData('');
          setIsImportOpen(false);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    }
  };

  const formatMainEventTime = () => {
    if (!mainEventTime || !mainEvent) return null;
    
    const timeUntil = Math.floor((mainEventTime - globalTime) / 1000);
    
    // Show positive time if past the main event time
    if (timeUntil <= 0) {
      const timePast = Math.abs(timeUntil);
      const hours = Math.floor(timePast / 3600);
      const minutes = Math.floor((timePast % 3600) / 60);
      const seconds = timePast % 60;
      
      if (hours > 0) {
        return `+${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `+${minutes}m ${seconds}s`;
      } else {
        return `+${seconds}s`;
      }
    }
    
    const hours = Math.floor(timeUntil / 3600);
    const minutes = Math.floor((timeUntil % 3600) / 60);
    const seconds = timeUntil % 60;
    
    // Add minus sign to countdown and format
    if (hours > 0) {
      return `-${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `-${minutes}m ${seconds}s`;
    } else {
      return `-${seconds}s`;
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
        <div 
          className="flex flex-col justify-center cursor-pointer min-h-[3rem] flex-1 min-w-0" 
          onClick={handleOpenTimeDialog}
          title="Click to edit main event"
        >
          <div className="overflow-hidden">
            <h1 
              ref={titleRef}
              className={`text-xl font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap`}
              data-needs-marquee={needsMarquee}
              style={{
                transform: needsMarquee ? `translateX(${animationOffset}px)` : 'translateX(0px)'
              }}
            >
              {renderStyledTitle()}
            </h1>
          </div>
          {mainEventTime && mainEvent && (
            <div className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
              {formatMainEventTime()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            onClick={handleOpenAddEventDialog}
            title="Add new event"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            onClick={onTogglePause}
            title={isPaused ? "Resume timeline" : "Pause timeline"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`p-2 ${isFilterOpen ? 
                  'text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-slate-600' : 
                  'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Filter className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className={`w-48 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
              <div className="px-2 py-1.5">
                <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Filter by Category</div>
                <div className="flex flex-col gap-1 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectAllCategories}
                    className={`h-6 px-2 text-xs w-full ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectNoneCategories}
                    className={`h-6 px-2 text-xs w-full ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                  >
                    Select None
                  </Button>
                </div>
                {availableCategories.map((category) => {
                  const colorObj = getCategoryColor(category);
                  return (
                    <div key={category} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => onCategoryToggle(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className={`text-sm cursor-pointer flex-1`}
                      >
                        <span 
                          className="inline-block px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: colorObj.bg,
                            color: colorObj.text,
                            border: `1px solid ${colorObj.border}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          {category}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>

            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu open={isKeyOpen} onOpenChange={setIsKeyOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`p-2 ${isKeyOpen ? 
                  'text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-slate-600' : 
                  'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={0} alignOffset={-32} className={`w-64 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
              <div className="px-3 py-2">
                <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3`}>Filter by Status</div>
                
                <div className="flex flex-col gap-1 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectAllStatuses}
                    className={`h-6 px-2 text-xs w-full ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectNoneStatuses}
                    className={`h-6 px-2 text-xs w-full ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                  >
                    Select None
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="status-completed"
                      checked={selectedStatuses.includes('completed')}
                      onCheckedChange={() => onStatusToggle('completed')}
                    />
                    <label
                      htmlFor="status-completed"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-xs">Completed</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="status-recently-completed"
                      checked={selectedStatuses.includes('recently-completed')}
                      onCheckedChange={() => onStatusToggle('recently-completed')}
                    />
                    <label
                      htmlFor="status-recently-completed"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-xs">Recently Completed</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="status-imminent"
                      checked={selectedStatuses.includes('imminent')}
                      onCheckedChange={() => onStatusToggle('imminent')}
                    />
                    <label
                      htmlFor="status-imminent"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-xs">Imminent (within threshold)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="status-upcoming"
                      checked={selectedStatuses.includes('upcoming')}
                      onCheckedChange={() => onStatusToggle('upcoming')}
                    />
                    <label
                      htmlFor="status-upcoming"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className="w-4 h-4 bg-slate-400 rounded"></div>
                      <span className="text-xs">Upcoming</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="status-main-event"
                      checked={selectedStatuses.includes('main-event')}
                      onCheckedChange={() => onStatusToggle('main-event')}
                    />
                    <label
                      htmlFor="status-main-event"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                      <span className="text-xs">Main Event</span>
                    </label>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={`p-2 ${isOpen ? 
                'text-slate-700 bg-slate-200 dark:text-slate-200 dark:bg-slate-600' : 
                'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-72 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
            <DropdownMenuItem onClick={handleOpenTimeDialog} className="cursor-pointer" style={{ color: '#a855f7 !important' }}>
              <Clock className="w-4 h-4 mr-2" style={{ color: '#a855f7' }} />
              <span style={{ color: '#a855f7' }}>Set Main Event Time</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleImportCSV} className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Upload className="w-4 h-4 mr-2" />
              Import from CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              <Save className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left">Data Cache</span>
              <MenuToggle 
                checked={cacheDataLocally} 
                onCheckedChange={onToggleCacheData}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              <ArrowDown className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left">Auto-scroll</span>
              <MenuToggle 
                checked={autoScrollEnabled} 
                onCheckedChange={onToggleAutoScroll}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              {darkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
              <span className="flex-1 text-left">Dark mode</span>
              <MenuToggle 
                checked={darkMode} 
                onCheckedChange={onToggleDarkMode}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              <div className={`w-4 h-2 rounded-full mr-2 ${progressBarEnabled ? 'bg-blue-700' : 'bg-slate-300'}`} />
              <span className="flex-1 text-left">Progress bar</span>
              <MenuToggle 
                checked={progressBarEnabled} 
                onCheckedChange={onToggleProgressBar}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenHistoryDialog} className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Clock className="w-4 h-4 mr-2" />
              Progress bar history ({progressBarHistoryLength === 0 ? 'All' : `${progressBarHistoryLength}s`})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              <Volume2 className="w-4 h-4 mr-2" />
              <span className="flex-1 text-left">Audio</span>
              <MenuToggle 
                checked={audioNotificationsEnabled} 
                onCheckedChange={onToggleAudioNotifications}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse mr-2" />
              <span className="flex-1 text-left">Blink</span>
              <MenuToggle 
                checked={blinkEnabled} 
                onCheckedChange={onToggleBlink}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className={`cursor-pointer flex items-center ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`} onSelect={(e) => e.preventDefault()}>
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse mr-2" />
              <span className="flex-1 text-left">Imminent blink</span>
              <MenuToggle 
                checked={imminentBlinkEnabled} 
                onCheckedChange={onToggleImminentBlink}
                darkMode={darkMode}
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenImminentDialog} className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Clock className="w-4 h-4 mr-2" />
              Imminent threshold ({imminentThreshold}s)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleGenerateClick} className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Random Events
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteAllClick} className="cursor-pointer" style={{ color: '#ef4444 !important' }}>
              <Trash2 className="w-4 h-4 mr-2" style={{ color: '#ef4444' }} />
              <span style={{ color: '#ef4444' }}>Delete All Events</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={() => { setIsAboutOpen(true); setIsOpen(false); }} 
              className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              <Info className="w-4 h-4 mr-2" />
              About
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* About Modal */}
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />

      {/* Main Event Time Dialog */}
      <MainEventDialog
        open={isTimeDialogOpen}
        onOpenChange={setIsTimeDialogOpen}
        mainEventTime={mainEventTime}
        mainEventTitle={mainEvent?.title || "Main Event"}
        mainEventDescription={mainEventDescription || "The primary event everything leads up to"}
        onSetMainEventTime={onSetMainEventTime}
        onUpdateMainEventTitle={onUpdateMainEventTitle}
        onUpdateMainEventDescription={onUpdateMainEventDescription}
        darkMode={darkMode}
      />

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent 
          className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">Add New Event</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Create a new event with a specified time offset from the main event
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-title" className="text-right">Title</Label>
              <Input
                id="add-title"
                value={addEventForm.title}
                onChange={(e) => setAddEventForm({...addEventForm, title: e.target.value})}
                autoFocus={false}
                className="col-span-3 border border-slate-300 dark:border-slate-600"
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-description" className="text-right">Description</Label>
              <Textarea
                id="add-description"
                value={addEventForm.description}
                onChange={(e) => setAddEventForm({...addEventForm, description: e.target.value})}
                className="col-span-3 border border-slate-300 dark:border-slate-600"
                style={{ resize: 'none' }}
                placeholder="Event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Timing</Label>
              <div className="col-span-3">
                <Select 
                  value={addEventForm.timing} 
                  onValueChange={(value) => setAddEventForm({...addEventForm, timing: value})}
                >
                  <SelectTrigger className="border border-slate-300 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before main event</SelectItem>
                    <SelectItem value="after">After main event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Time offset</Label>
              <div className="col-span-3 flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="add-hours" className="text-xs">Hours</Label>
                  <Input
                    id="add-hours"
                    type="number"
                    min="0"
                    value={addEventForm.hours}
                    onChange={(e) => setAddEventForm({...addEventForm, hours: parseInt(e.target.value) || 0})}
                    className="border border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="add-minutes" className="text-xs">Minutes</Label>
                  <Input
                    id="add-minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={addEventForm.minutes}
                    onChange={(e) => setAddEventForm({...addEventForm, minutes: parseInt(e.target.value) || 0})}
                    className="border border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="add-seconds" className="text-xs">Seconds</Label>
                  <Input
                    id="add-seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={addEventForm.seconds}
                    onChange={(e) => setAddEventForm({...addEventForm, seconds: parseInt(e.target.value) || 0})}
                    className="border border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-category" className="text-right">Category</Label>
              <div className="col-span-3">
                <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between border border-gray-300 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        {addEventForm.category ? (
                          <span 
                            className="px-2 py-1 rounded text-sm font-medium"
                            style={{
                              backgroundColor: getCategoryColor(addEventForm.category).bg,
                              borderColor: getCategoryColor(addEventForm.category).border,
                              color: getCategoryColor(addEventForm.category).text,
                              border: `1px solid ${getCategoryColor(addEventForm.category).border}`
                            }}
                          >
                            {addEventForm.category}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Select category...</span>
                        )}
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto border border-gray-300 dark:border-gray-600" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {availableEventCategories.map((cat) => {
                      const colors = getCategoryColor(cat);
                      return (
                        <DropdownMenuItem
                          key={cat}
                          onClick={() => {
                            setAddEventForm({...addEventForm, category: cat});
                            setCategoryOpen(false);
                          }}
                          className="cursor-pointer p-2"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span 
                              className="flex-1 px-2 py-1 rounded text-sm font-medium"
                              style={{
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                                color: colors.text,
                                border: `1px solid ${colors.border}`
                              }}
                            >
                              {cat}
                            </span>
                            {addEventForm.category === cat && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="New category..."
                          value={categorySearchValue}
                          onChange={(e) => setCategorySearchValue(e.target.value)}
                          className="text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && categorySearchValue.trim()) {
                              setAddEventForm({...addEventForm, category: categorySearchValue.trim()});
                              setCategoryOpen(false);
                              setCategorySearchValue('');
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (categorySearchValue.trim()) {
                              setAddEventForm({...addEventForm, category: categorySearchValue.trim()});
                              setCategoryOpen(false);
                              setCategorySearchValue('');
                            }
                          }}
                          disabled={!categorySearchValue.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddEventOpen(false)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEventSubmit}
              disabled={!addEventForm.title.trim() || !addEventForm.description.trim() || !addEventForm.category.trim()}
            >
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Export Events as CSV</DialogTitle>
            <DialogDescription>
              Export your current events as CSV data for backup or sharing
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-data">CSV Data</Label>
              <Textarea
                id="csv-data"
                value={csvData}
                readOnly
                className="min-h-[200px] font-mono text-sm border border-slate-300 dark:border-slate-600"
                placeholder="CSV data will appear here..."
              />
            </div>
            <div className="text-sm text-slate-600">
              Includes: Seconds to Main Event, Title, Description, Category
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportOpen(false)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Close
            </Button>
            <Button
              onClick={copyToClipboard}
              disabled={!csvData}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent 
          className="sm:max-w-[600px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Import Events from CSV</DialogTitle>
            <DialogDescription>
              Paste CSV data to import events into your timeline
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-csv-data">CSV Data</Label>
              <Textarea
                id="import-csv-data"
                value={importCsvData}
                onChange={(e) => setImportCsvData(e.target.value)}
                className="min-h-[200px] font-mono text-sm border border-slate-300 dark:border-slate-600"
                placeholder="0,Project Launch,Main launch event,14:30:00&#10;-300,Final Preparation Phase,Last phase before launch,Phase&#10;-600,Team Meeting,Pre-launch team sync,Work&#10;-900,Setup Complete,All systems ready,Technical&#10;120,Post-Launch Review,Review session after launch,Work"
              />
            </div>
            <div className="text-sm text-slate-600">
              Format: Seconds to Main Event, Title, Description, Category
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(false)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={!importCsvData.trim()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Events
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Imminent Threshold Dialog */}
      <Dialog open={isImminentDialogOpen} onOpenChange={setIsImminentDialogOpen}>
        <DialogContent 
          className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">Set Imminent Threshold</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Choose how many seconds before an event it should be highlighted in yellow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="threshold" className="text-slate-700 dark:text-slate-300">
                Threshold (seconds before event becomes yellow)
              </Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                max="60"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                onFocus={(e) => e.target.select()}
                onContextMenu={(e) => e.preventDefault()}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                autoFocus={false}
              />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Events within this time range will be highlighted in yellow. Range: 1-60 seconds.
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsImminentDialogOpen(false)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImminentThresholdSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Bar History Length Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent 
          className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">Set Progress Bar History</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Choose how far back in time the progress bar should show events.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="historyLength" className="text-slate-700 dark:text-slate-300">
                History length (seconds)
              </Label>
              <Input
                id="historyLength"
                type="number"
                min="0"
                value={tempHistoryLength}
                onChange={(e) => setTempHistoryLength(Math.max(0, parseInt(e.target.value) || 0))}
                onFocus={(e) => e.target.select()}
                onContextMenu={(e) => e.preventDefault()}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                autoFocus={false}
              />
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Set to 0 to show all events. Positive values limit how many seconds in the past to display on the progress bar.
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsHistoryDialogOpen(false)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleHistoryLengthSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
