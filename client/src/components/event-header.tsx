import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Trash2, ArrowDown, Filter, Clock, Play, Pause, ChevronDown, Check, Download, Copy, Upload, Volume2, Zap, Moon, Sun, Info, Target, HelpCircle, Save } from "lucide-react";
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
  onSetMainEventTime: (timestamp: number) => void;
  onUpdateMainEventTitle: (title: string) => void;
  mainEventTime?: number;
  mainEvent?: Event | null;
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
  darkMode: boolean;
  onToggleDarkMode: () => void;
  imminentThreshold: number;
  onSetImminentThreshold: (seconds: number) => void;
  imminentBlinkEnabled: boolean;
  onToggleImminentBlink: () => void;
  globalTime: number;
  cacheDataLocally: boolean;
  onToggleCacheData: () => void;
}

export function EventHeader({ onGenerateEvents, onDeleteAllEvents, autoScrollEnabled, onToggleAutoScroll, selectedCategories, onCategoryToggle, onSelectAllCategories, onSelectNoneCategories, availableCategories, onSetMainEventTime, onUpdateMainEventTitle, mainEventTime, mainEvent, isPaused, onTogglePause, onAddEvent, onImportEvents, events, audioNotificationsEnabled, onToggleAudioNotifications, blinkEnabled, onToggleBlink, progressBarEnabled, onToggleProgressBar, darkMode, onToggleDarkMode, imminentThreshold, onSetImminentThreshold, imminentBlinkEnabled, onToggleImminentBlink, globalTime, cacheDataLocally, onToggleCacheData }: EventHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isImminentDialogOpen, setIsImminentDialogOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(imminentThreshold);
  const [addEventForm, setAddEventForm] = useState({
    title: '',
    description: '',
    category: '',
    hours: 0,
    minutes: 1,
    seconds: 0
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [mainEventTitle, setMainEventTitle] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importCsvData, setImportCsvData] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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

  const handleAddEventSubmit = () => {
    if (addEventForm.title.trim() && addEventForm.description.trim() && addEventForm.category.trim()) {
      const totalSeconds = (addEventForm.hours * 3600) + (addEventForm.minutes * 60) + addEventForm.seconds;
      
      onAddEvent({
        title: addEventForm.title.trim(),
        description: addEventForm.description.trim(),
        category: addEventForm.category.trim(),
        timeToEvent: totalSeconds
      });
      
      // Reset form
      setAddEventForm({
        title: '',
        description: '',
        category: '',
        hours: 0,
        minutes: 1,
        seconds: 0
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

  // Get categories dynamically from existing events (excluding main event)
  const availableEventCategories = Array.from(new Set(events.filter(event => event.category !== '').map(event => event.category)));

  const generateCSV = () => {
    const header = 'Seconds to Main Event,Title,Description,Category\n';
    const rows = events
      .filter(event => event.timeToEvent !== 0) // Exclude main event
      .sort((a, b) => b.timeToEvent - a.timeToEvent) // Sort by time to event (descending)
      .map(event => {
        // Escape quotes and wrap fields in quotes if they contain commas or quotes
        const escapeCSV = (field: string) => {
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        };
        
        return `${event.timeToEvent},${escapeCSV(event.title)},${escapeCSV(event.description)},${escapeCSV(event.category)}`;
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

  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const events: { title: string; description: string; category: string; timeToEvent: number }[] = [];
    
    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes('seconds') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      if (values.length >= 4) {
        const timeToEvent = parseInt(values[0]);
        if (!isNaN(timeToEvent) && timeToEvent > 0) {
          events.push({
            timeToEvent,
            title: values[1].trim(),
            description: values[2].trim(),
            category: values[3].trim()
          });
        }
      }
    }
    
    return events;
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
        const events = parseCSV(importCsvData);
        if (events.length > 0) {
          onImportEvents(events);
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
    
    // If past the main event time, show "Complete!"
    if (timeUntil <= 0) {
      return "Complete!";
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
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <div 
          className="flex flex-col cursor-pointer" 
          onClick={handleOpenTimeDialog}
          title="Click to edit main event"
        >
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {mainEvent ? mainEvent.title : "Event Timeline"}
          </h1>
          {mainEventTime && mainEvent && (
            <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              {formatMainEventTime()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            onClick={onTogglePause}
            title={isPaused ? "Resume timeline" : "Pause timeline"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
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
            <DropdownMenuContent align="center" className={`w-64 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
              <div className="px-3 py-2">
                <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3`}>Event Status Legend</div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">Recently Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Imminent (within threshold)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-400 rounded"></div>
                    <span className="text-xs">Upcoming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7c3aed' }}></div>
                    <span className="text-xs">Main Event</span>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => { setIsAboutOpen(true); setIsKeyOpen(false); }} 
                className={`cursor-pointer ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Filter Categories</div>
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
                {availableCategories.map((category) => (
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
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                        {category}
                      </span>
                    </label>
                  </div>
                ))}
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
              <div className={`w-4 h-2 rounded-full mr-2 ${progressBarEnabled ? 'bg-blue-700' : 'bg-slate-300'}`} />
              <span className="flex-1 text-left">Progress bar</span>
              <MenuToggle 
                checked={progressBarEnabled} 
                onCheckedChange={onToggleProgressBar}
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
            <DropdownMenuItem onClick={() => { setIsAddEventOpen(true); setIsOpen(false); }} className={`cursor-pointer ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </DropdownMenuItem>
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
        onSetMainEventTime={onSetMainEventTime}
        onUpdateMainEventTitle={onUpdateMainEventTitle}
        darkMode={darkMode}
      />

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-title" className="text-right">Title</Label>
              <Input
                id="add-title"
                value={addEventForm.title}
                onChange={(e) => setAddEventForm({...addEventForm, title: e.target.value})}
                className="col-span-3"
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-description" className="text-right">Description</Label>
              <Input
                id="add-description"
                value={addEventForm.description}
                onChange={(e) => setAddEventForm({...addEventForm, description: e.target.value})}
                className="col-span-3"
                placeholder="Event description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Time before main event</Label>
              <div className="col-span-3 flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="add-hours" className="text-xs">Hours</Label>
                  <Input
                    id="add-hours"
                    type="number"
                    min="0"
                    value={addEventForm.hours}
                    onChange={(e) => setAddEventForm({...addEventForm, hours: parseInt(e.target.value) || 0})}
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
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-category" className="text-right">Category</Label>
              <div className="col-span-3">
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between"
                    >
                      {addEventForm.category || "Select category..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {availableEventCategories.map((cat) => (
                            <CommandItem
                              key={cat}
                              value={cat}
                              onSelect={(value) => {
                                setAddEventForm({...addEventForm, category: value});
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  addEventForm.category === cat ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {cat}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  placeholder="Or type custom category"
                  value={addEventForm.category}
                  onChange={(e) => setAddEventForm({...addEventForm, category: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddEventOpen(false)}
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
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csv-data">CSV Data</Label>
              <Textarea
                id="csv-data"
                value={csvData}
                readOnly
                className="min-h-[200px] font-mono text-sm"
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Events from CSV</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-csv-data">Paste CSV Data</Label>
              <div className="text-sm text-slate-600">
                Format: offset in seconds,title,description,category
              </div>
              <Textarea
                id="import-csv-data"
                value={importCsvData}
                onChange={(e) => setImportCsvData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="300,Meeting Start,Important team meeting,Work&#10;240,Preparation Time,Final preparations,Work&#10;180,Coffee Break,Last minute coffee,Personal"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(false)}
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
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
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
    </header>
  );
}
