import { useState, useEffect, useRef } from "react";
import { EventHeader } from "@/components/event-header";
import { EventCard } from "@/components/event-card";
import { InstallPrompt } from "@/components/install-prompt";
import { MainEventDialog } from "@/components/main-event-dialog";
import { useEvents } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus } from "lucide-react";
import { Event as EventType } from "@shared/schema";
import { formatTime } from "@/lib/event-utils";

export default function Home() {
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState<number | null>(null);

  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['upcoming', 'imminent', 'recently-completed', 'completed', 'main-event']);
  const [audioNotificationsEnabled, setAudioNotificationsEnabled] = useState(false);
  const [blinkEnabled, setBlinkEnabled] = useState(false);
  const [progressBarEnabled, setProgressBarEnabled] = useState(true);
  const [progressBarHistoryLength, setProgressBarHistoryLength] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);
  const [imminentThreshold, setImminentThreshold] = useState(10);
  const [imminentBlinkEnabled, setImminentBlinkEnabled] = useState(false);
  const [isImminentBlinking, setIsImminentBlinking] = useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [cacheDataLocally, setCacheDataLocally] = useState(false);
  const [triggerImportFromHeader, setTriggerImportFromHeader] = useState(false);
  const [dynamicHeaderTitle, setDynamicHeaderTitle] = useState<string | null>(null);
  const [urlImportCompleted, setUrlImportCompleted] = useState(false);
  
  // Function to get current time, respecting pause state
  const getCurrentTime = () => {
    if (isPaused && pausedTime !== null) {
      return pausedTime;
    }
    return Date.now();
  };
  
  const { events, generateRandomEvents, deleteAllEvents, setMainEventTime, updateMainEventTitle, updateMainEventDescription, updateEvent, addEvent, deleteEvent, sortedEvents, mainEventTime, mainEvent, importEvents } = useEvents(getCurrentTime, imminentThreshold);
  const lastCompletedEventRef = useRef<string | null>(null);
  const lastImminentEventsRef = useRef<Set<string>>(new Set());
  const [globalTime, setGlobalTime] = useState(Date.now());

  // Check for URL parameter on first load and fetch CSV file
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventsUrl = urlParams.get('events');
    
    if (eventsUrl && !urlImportCompleted) {
      // Handle relative URLs by making them absolute
      const absoluteUrl = eventsUrl.startsWith('http') ? eventsUrl : 
                         eventsUrl.startsWith('/') ? eventsUrl :
                         `/${eventsUrl}`;
      
      // Fetch CSV file from the provided URL
      fetch(absoluteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv,text/plain,*/*'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(csvText => {
          // Use the same parsing logic from event-header component
          const parseCSV = (csvText: string) => {
            const lines = csvText.trim().split('\n');
            const events: { title: string; description: string; category: string; timeToEvent: number }[] = [];
            let mainEventData: { title: string; description: string; timestamp?: number } | null = null;
            
            // Skip header if present
            const startIndex = lines[0]?.toLowerCase().includes('seconds') ? 1 : 0;
            
            const parseCSVLine = (line: string) => {
              const values = [];
              let current = '';
              let inQuotes = false;
              let i = 0;
              
              while (i < line.length) {
                const char = line[i];
                
                if (char === '"') {
                  if (inQuotes && line[i + 1] === '"') {
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
                      timeToEvent: timeToEvent,
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
          
          const { events: parsedEvents, mainEventData } = parseCSV(csvText);
          
          // Update main event if we found 0s data
          if (mainEventData) {
            updateMainEventTitle(mainEventData.title);
            updateMainEventDescription(mainEventData.description);
            if ('timestamp' in mainEventData && mainEventData.timestamp) {
              setMainEventTime(mainEventData.timestamp);
            }
          }
          
          // Import the regular events
          if (parsedEvents.length > 0) {
            importEvents(parsedEvents);
          }
          
          // Mark import as completed to prevent repeated attempts
          setUrlImportCompleted(true);
        })
        .catch(error => {
          console.error('Error loading events from URL:', error);
          console.error('URL attempted:', eventsUrl);
          console.error('Error details:', error.message);
        });
    }
  }, []); // Only run once on mount, don't include dependencies to avoid infinite loop



  // Centralized timer - updates all countdowns 5 times per second
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalTime(getCurrentTime());
    }, 200);
    
    return () => clearInterval(interval);
  }, [getCurrentTime]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    // Load cache setting first
    const savedCacheData = localStorage.getItem('cacheDataLocally');
    if (savedCacheData) {
      const shouldCache = JSON.parse(savedCacheData);
      setCacheDataLocally(shouldCache);
      
      // If cache is enabled, load all saved data
      if (shouldCache) {
        const savedData = localStorage.getItem('timelineAppData');
        if (savedData) {
          try {
            const data = JSON.parse(savedData);
            setAutoScrollEnabled(data.autoScrollEnabled ?? true);
            setSelectedCategories(data.selectedCategories ?? []);
            setAudioNotificationsEnabled(data.audioNotificationsEnabled ?? false);
            setBlinkEnabled(data.blinkEnabled ?? false);
            setProgressBarEnabled(data.progressBarEnabled ?? true);
            setDarkMode(data.darkMode ?? true);
            setImminentThreshold(data.imminentThreshold ?? 10);
            setImminentBlinkEnabled(data.imminentBlinkEnabled ?? false);
            
            // Events and main event time will be restored by the useEvents hook
          } catch (e) {
            console.warn('Failed to load saved data:', e);

          }
        }
      }
    }
    
    // Always load dark mode setting (maintains existing behavior)
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      // Apply dark mode class to document element
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Save cache toggle setting to localStorage
  useEffect(() => {
    localStorage.setItem('cacheDataLocally', JSON.stringify(cacheDataLocally));
  }, [cacheDataLocally]);

  // Save all app data to localStorage when cache is enabled
  useEffect(() => {
    if (cacheDataLocally) {
      const dataToSave = {
        autoScrollEnabled,
        selectedCategories,
        audioNotificationsEnabled,
        blinkEnabled,
        progressBarEnabled,
        darkMode,
        imminentThreshold,
        imminentBlinkEnabled,
        events,
        mainEventTime
      };
      localStorage.setItem('timelineAppData', JSON.stringify(dataToSave));
    }
  }, [cacheDataLocally, autoScrollEnabled, selectedCategories, audioNotificationsEnabled, blinkEnabled, progressBarEnabled, darkMode, imminentThreshold, imminentBlinkEnabled, events, mainEventTime]);

  // Save dark mode setting to localStorage and apply to document whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Apply dark mode class to document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get all unique categories from events, excluding main event (timeToEvent === 0)
  const availableCategories = Array.from(new Set(events.filter(event => event.timeToEvent !== 0).map(event => event.category).filter(category => category !== '')));

  // Initialize selectedCategories with all available categories when events are generated
  useEffect(() => {
    if (availableCategories.length > 0) {
      setSelectedCategories([...availableCategories]);
    }
  }, [availableCategories.length]);

  // Filter events by selected categories and statuses
  const filteredEvents = sortedEvents.filter(event => {
    // Check if this is the main event
    if (event.timeToEvent === 0) {
      // Main event has its own filter category
      return selectedStatuses.length === 0 || selectedStatuses.includes('main-event');
    }
    
    // Check category filter for regular events
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(event.category);
    
    // Determine visual status based on event state
    let visualStatus = 'upcoming'; // default grey
    
    if (event.status === 'completed') {
      // Check if recently completed (green) vs completed (blue)
      if (!mainEventTime) {
        visualStatus = 'completed';
      } else {
        const currentTime = getCurrentTime();
        const eventTargetTime = mainEventTime + (event.timeToEvent * 1000);
        const timeSinceCompletion = currentTime - eventTargetTime;
        
        // Recently completed if completed within last 5 seconds
        visualStatus = timeSinceCompletion <= 5000 ? 'recently-completed' : 'completed';
      }
    } else if (event.status === 'upcoming' && mainEventTime) {
      // Check if imminent (yellow) vs upcoming (grey)
      const currentTime = getCurrentTime();
      const eventTargetTime = mainEventTime + (event.timeToEvent * 1000);
      const remainingTime = Math.max(0, Math.floor((eventTargetTime - currentTime) / 1000));
      
      if (remainingTime <= imminentThreshold && remainingTime > 0) {
        visualStatus = 'imminent';
      }
    }
    
    // Check status filter
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(visualStatus);
    
    return categoryMatch && statusMatch;
  });

  // Update header title only when events complete
  useEffect(() => {
    if (!mainEventTime || !mainEvent) return;
    
    // Find all completed relevant events (main event at 0s OR phase events)
    const relevantCompletedEvents = events.filter(event => 
      event.status === 'completed' && 
      (event.timeToEvent === 0 || event.category.toLowerCase().includes('phase'))
    );
    
    if (relevantCompletedEvents.length === 0) {
      setDynamicHeaderTitle(null);
      return;
    }
    
    // Find the most recently completed relevant event
    const mostRecentEvent = relevantCompletedEvents.reduce((latest, event) => {
      const eventTargetTime = mainEventTime + (event.timeToEvent * 1000);
      const latestTargetTime = mainEventTime + (latest.timeToEvent * 1000);
      
      return eventTargetTime > latestTargetTime ? event : latest;
    });
    
    // Set title based on the most recent relevant completion
    if (mostRecentEvent.timeToEvent === 0) {
      // Most recent was main event
      setDynamicHeaderTitle(mainEvent.title);
    } else if (mostRecentEvent.category.toLowerCase().includes('phase')) {
      // Most recent was phase event
      const combinedTitle = `${mainEvent.title} - ${mostRecentEvent.title}`;
      setDynamicHeaderTitle(combinedTitle);
    }
  }, [events, mainEventTime, mainEvent]);



  const handleGenerateEvents = () => {
    generateRandomEvents();
  };

  const handleDeleteAllEvents = () => {
    deleteAllEvents();
  };

  const handleToggleAutoScroll = () => {
    setAutoScrollEnabled(!autoScrollEnabled);
  };

  const handleToggleAudioNotifications = () => {
    setAudioNotificationsEnabled(!audioNotificationsEnabled);
  };

  const handleToggleBlink = () => {
    setBlinkEnabled(!blinkEnabled);
  };

  const handleToggleImminentBlink = () => {
    setImminentBlinkEnabled(!imminentBlinkEnabled);
  };

  const handleToggleProgressBar = () => {
    setProgressBarEnabled(!progressBarEnabled);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleCacheData = () => {
    setCacheDataLocally(!cacheDataLocally);
  };

  const triggerBlink = () => {
    if (blinkEnabled) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 275); // 25ms fade-in + 250ms fade-out
    }
  }

  const triggerImminentBlink = () => {
    if (imminentBlinkEnabled) {
      setIsImminentBlinking(true);
      setTimeout(() => setIsImminentBlinking(false), 275); // 25ms fade-in + 250ms fade-out
    }
  };

  // Audio notification function
  const playNotificationBeep = () => {
    if (!audioNotificationsEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440Hz
      
      // Fade in over 50ms
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.05);
      
      // Fade out over 250ms
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio notification failed:', error);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories([...availableCategories]);
  };

  const handleSelectNoneCategories = () => {
    setSelectedCategories([]);
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSelectAllStatuses = () => {
    setSelectedStatuses(['upcoming', 'imminent', 'recently-completed', 'completed', 'main-event']);
  };

  const handleSelectNoneStatuses = () => {
    setSelectedStatuses([]);
  };

  const handleEditEvent = (updatedEvent: EventType) => {
    // Check if this is a deletion request
    if ((updatedEvent as any)._deleted) {
      deleteEvent(updatedEvent.id);
    } else {
      updateEvent(updatedEvent.id, updatedEvent);
    }
  };

  const handleAddEvent = (newEvent: { title: string; description: string; category: string; timeToEvent: number }) => {
    addEvent(newEvent.title, newEvent.description, newEvent.category, newEvent.timeToEvent);
  };

  const handleImportEvents = (newEvents: { title: string; description: string; category: string; timeToEvent: number }[]) => {
    newEvents.forEach(event => {
      addEvent(event.title, event.description, event.category, event.timeToEvent);
    });
  };

  const handleImportCSV = () => {
    setTriggerImportFromHeader(true);
  };

  const handleImportTriggered = () => {
    setTriggerImportFromHeader(false);
  };





  const handleOpenTimeDialog = () => {
    setIsTimeDialogOpen(true);
  };

  const handleTogglePause = () => {
    if (!isPaused) {
      // Pausing - capture current time
      setPausedTime(Date.now());
    } else {
      // Resuming - reset paused time
      setPausedTime(null);
    }
    setIsPaused(!isPaused);
  };



  // Auto-scroll functionality and audio notifications when events complete
  useEffect(() => {
    const completedEvents = filteredEvents.filter(event => event.status === 'completed');
    if (completedEvents.length === 0) return;

    const lastCompleted = completedEvents[completedEvents.length - 1];
    if (lastCompleted && lastCompleted.id !== lastCompletedEventRef.current) {
      lastCompletedEventRef.current = lastCompleted.id;
      
      // Play audio notification for visible event completion
      playNotificationBeep();
      
      // Trigger blink for visible event completion
      triggerBlink();
      
      // Auto-scroll if enabled and not paused
      if (autoScrollEnabled && !isPaused) {
        // Find the element and scroll to it at 25% down from top
        setTimeout(() => {
          const element = document.querySelector(`[data-event-id="${lastCompleted.id}"]`);
          if (element) {
            const rect = element.getBoundingClientRect();
            const targetPosition = window.scrollY + rect.top - (window.innerHeight * 0.25);
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [filteredEvents, autoScrollEnabled, playNotificationBeep]);

  // Monitor events becoming imminent and trigger yellow blink
  useEffect(() => {
    if (!mainEventTime || isPaused) return;

    const currentTime = getCurrentTime();
    const currentImminentEvents = new Set<string>();

    filteredEvents.forEach(event => {
      if (event.status === 'upcoming') {
        let remainingTime;
        
        if (event.timeToEvent === 0) {
          // Main event - calculate remaining time directly
          remainingTime = Math.max(0, Math.floor((mainEventTime - currentTime) / 1000));
        } else {
          // Regular event - calculate from main event time
          const eventTargetTime = mainEventTime + (event.timeToEvent * 1000);
          remainingTime = Math.max(0, Math.floor((eventTargetTime - currentTime) / 1000));
        }
        
        if (remainingTime <= imminentThreshold && remainingTime > 0) {
          currentImminentEvents.add(event.id);
          
          // Check if this event just became imminent (wasn't imminent before)
          if (!lastImminentEventsRef.current.has(event.id)) {
            triggerImminentBlink();
          }
        }
      }
    });

    // Update the ref with current imminent events
    lastImminentEventsRef.current = currentImminentEvents;
  }, [filteredEvents, mainEventTime, getCurrentTime, imminentThreshold, isPaused, triggerImminentBlink]);

  // Auto-scroll on filter changes
  useEffect(() => {
    if (!autoScrollEnabled || isPaused) return;

    const completedEvents = filteredEvents.filter(event => event.status === 'completed');
    if (completedEvents.length === 0) return;

    const lastCompleted = completedEvents[completedEvents.length - 1];
    if (lastCompleted) {
      // Find the element and scroll to it at 25% down from top
      setTimeout(() => {
        const element = document.querySelector(`[data-event-id="${lastCompleted.id}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const targetPosition = window.scrollY + rect.top - (window.innerHeight * 0.25);
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [selectedCategories, autoScrollEnabled, filteredEvents]);

  // Show generate events card if there are no events or only the main event
  if (events.length === 0 || (events.length === 1 && events[0].timeToEvent === 0)) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
        <EventHeader onGenerateEvents={handleGenerateEvents} onDeleteAllEvents={handleDeleteAllEvents} autoScrollEnabled={autoScrollEnabled} onToggleAutoScroll={handleToggleAutoScroll} selectedCategories={selectedCategories} onCategoryToggle={handleCategoryToggle} onSelectAllCategories={handleSelectAllCategories} onSelectNoneCategories={handleSelectNoneCategories} availableCategories={availableCategories} selectedStatuses={selectedStatuses} onStatusToggle={handleStatusToggle} onSelectAllStatuses={handleSelectAllStatuses} onSelectNoneStatuses={handleSelectNoneStatuses} onSetMainEventTime={setMainEventTime} onUpdateMainEventTitle={updateMainEventTitle} onUpdateMainEventDescription={updateMainEventDescription} mainEventDescription={mainEvent?.description || "The primary event everything leads up to"} mainEventTime={mainEventTime} mainEvent={mainEvent} isPaused={isPaused} onTogglePause={handleTogglePause} onAddEvent={handleAddEvent} onImportEvents={handleImportEvents} events={events} audioNotificationsEnabled={audioNotificationsEnabled} onToggleAudioNotifications={handleToggleAudioNotifications} blinkEnabled={blinkEnabled} onToggleBlink={handleToggleBlink} progressBarEnabled={progressBarEnabled} onToggleProgressBar={handleToggleProgressBar} progressBarHistoryLength={progressBarHistoryLength} onSetProgressBarHistoryLength={setProgressBarHistoryLength} darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} imminentThreshold={imminentThreshold} onSetImminentThreshold={setImminentThreshold} imminentBlinkEnabled={imminentBlinkEnabled} onToggleImminentBlink={handleToggleImminentBlink} globalTime={globalTime} cacheDataLocally={cacheDataLocally} onToggleCacheData={handleToggleCacheData} triggerImport={triggerImportFromHeader} onImportTriggered={handleImportTriggered} dynamicHeaderTitle={dynamicHeaderTitle} />
        <main className={`max-w-4xl mx-auto px-6 py-8 ${progressBarEnabled && filteredEvents.length > 1 ? 'pb-64' : 'pb-8'}`}>
          <div className="space-y-1">
            {/* Show main event card if it exists */}
            {events.length === 1 && events[0].timeToEvent === 0 && (
              <EventCard 
                key={events[0].id} 
                event={events[0]} 
                isLastCompleted={false} 
                onEditEvent={handleEditEvent} 
                getCurrentTime={getCurrentTime}
                onSetMainEventTime={setMainEventTime}
                onUpdateMainEventTitle={updateMainEventTitle}
                imminentThreshold={imminentThreshold}
                globalTime={globalTime}
              />
            )}
            
            {/* Spacing between main event and generate events card */}
            {events.length === 1 && events[0].timeToEvent === 0 && (
              <div className="h-4"></div>
            )}
            
            {/* Generate events card */}
            <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-6 py-8 text-center">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Calendar className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No timeline events yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Create events to get started</p>
              
              <div className="flex flex-col gap-3 items-center">
                <Button 
                  onClick={handleOpenTimeDialog}
                  className="px-6 py-2 !bg-purple-600 !text-white hover:!bg-purple-700 !border-purple-600"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}
                >
                  Set Main Event Time
                </Button>
                
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={handleGenerateEvents}
                    className="px-4 py-2 !bg-blue-600 !text-white hover:!bg-blue-700 !border-blue-600"
                    style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                  >
                    Generate Test Events
                  </Button>
                  <Button 
                    onClick={handleImportCSV}
                    className="px-4 py-2 !bg-green-600 !text-white hover:!bg-green-700 !border-green-600"
                    style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                  >
                    Import Events List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        

        {/* Main Event Time Dialog */}
        <MainEventDialog
          open={isTimeDialogOpen}
          onOpenChange={setIsTimeDialogOpen}
          mainEventTime={mainEventTime}
          mainEventTitle={mainEvent?.title || "Main Event"}
          mainEventDescription={mainEvent?.description || "The primary event everything leads up to"}
          onSetMainEventTime={setMainEventTime}
          onUpdateMainEventTitle={updateMainEventTitle}
          onUpdateMainEventDescription={updateMainEventDescription}
          darkMode={darkMode}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Blink overlay - positioned below header/modals but above event cards */}
      {isBlinking && (
        <div 
          className="fixed inset-0 bg-green-500 pointer-events-none"
          style={{
            zIndex: 10,
            animation: 'blink-green 275ms ease-out forwards'
          }}
        />
      )}
      {/* Imminent blink overlay - positioned below header/modals but above event cards */}
      {isImminentBlinking && (
        <div 
          className="fixed inset-0 bg-yellow-500 pointer-events-none"
          style={{
            zIndex: 10,
            animation: 'blink-green 275ms ease-out forwards'
          }}
        />
      )}
      <EventHeader onGenerateEvents={handleGenerateEvents} onDeleteAllEvents={handleDeleteAllEvents} autoScrollEnabled={autoScrollEnabled} onToggleAutoScroll={handleToggleAutoScroll} selectedCategories={selectedCategories} onCategoryToggle={handleCategoryToggle} onSelectAllCategories={handleSelectAllCategories} onSelectNoneCategories={handleSelectNoneCategories} availableCategories={availableCategories} selectedStatuses={selectedStatuses} onStatusToggle={handleStatusToggle} onSelectAllStatuses={handleSelectAllStatuses} onSelectNoneStatuses={handleSelectNoneStatuses} onSetMainEventTime={setMainEventTime} onUpdateMainEventTitle={updateMainEventTitle} onUpdateMainEventDescription={updateMainEventDescription} mainEventDescription={mainEvent?.description || "The primary event everything leads up to"} mainEventTime={mainEventTime} mainEvent={mainEvent} isPaused={isPaused} onTogglePause={handleTogglePause} onAddEvent={handleAddEvent} onImportEvents={handleImportEvents} events={events} audioNotificationsEnabled={audioNotificationsEnabled} onToggleAudioNotifications={handleToggleAudioNotifications} blinkEnabled={blinkEnabled} onToggleBlink={handleToggleBlink} progressBarEnabled={progressBarEnabled} onToggleProgressBar={handleToggleProgressBar} progressBarHistoryLength={progressBarHistoryLength} onSetProgressBarHistoryLength={setProgressBarHistoryLength} darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} imminentThreshold={imminentThreshold} onSetImminentThreshold={setImminentThreshold} imminentBlinkEnabled={imminentBlinkEnabled} onToggleImminentBlink={handleToggleImminentBlink} globalTime={globalTime} cacheDataLocally={cacheDataLocally} onToggleCacheData={handleToggleCacheData} triggerImport={triggerImportFromHeader} onImportTriggered={handleImportTriggered} dynamicHeaderTitle={dynamicHeaderTitle} />
      <main className={`max-w-4xl mx-auto px-6 py-8 ${progressBarEnabled && filteredEvents.length > 1 ? 'pb-64' : 'pb-8'}`}>
        <div className="space-y-1">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isLastCompleted={event.isLastCompleted} 
              onEditEvent={handleEditEvent} 
              getCurrentTime={getCurrentTime}
              onSetMainEventTime={event.timeToEvent === 0 ? setMainEventTime : undefined}
              onUpdateMainEventTitle={event.timeToEvent === 0 ? updateMainEventTitle : undefined}
              imminentThreshold={imminentThreshold}
              globalTime={globalTime}
              availableCategories={availableCategories}
            />
          ))}
          
          {/* Extra spacing when progress bar is visible */}
          {progressBarEnabled && filteredEvents.length > 1 && (
            <div className="h-36"></div>
          )}
        </div>
      </main>
      
      {/* Timeline bar at bottom */}
      {progressBarEnabled && filteredEvents.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 z-20">
          <div className="max-w-4xl mx-auto relative">
            {/* Timeline line with progress */}
            <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full relative">
              {/* Progress bar */}
              {(() => {
                // Calculate progress based on current time position
                if (!mainEventTime || filteredEvents.length <= 1) return null;
                
                const currentTime = getCurrentTime();
                
                // Determine the timeline range based on history setting
                let timelineStartTime: number;
                let timelineEndTime: number;
                
                if (progressBarHistoryLength > 0) {
                  // Scale from (current time minus history) to (last event time)
                  timelineStartTime = currentTime - (progressBarHistoryLength * 1000);
                  const timeOffsets = filteredEvents.map(e => e.timeToEvent);
                  const maxOffset = Math.max(...timeOffsets);
                  timelineEndTime = mainEventTime + (maxOffset * 1000);
                } else {
                  // Show all events: scale from earliest to latest event
                  const timeOffsets = filteredEvents.map(e => e.timeToEvent);
                  const minOffset = Math.min(...timeOffsets);
                  const maxOffset = Math.max(...timeOffsets);
                  timelineStartTime = mainEventTime + (minOffset * 1000);
                  timelineEndTime = mainEventTime + (maxOffset * 1000);
                }
                
                const totalTimeRange = timelineEndTime - timelineStartTime;
                if (totalTimeRange <= 0) return null;
                
                const timeElapsed = currentTime - timelineStartTime;
                const progressPercent = Math.max(0, Math.min(100, (timeElapsed / totalTimeRange) * 100));
                
                return (
                  <div 
                    className="h-full bg-blue-700 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                );
              })()}
              
              {/* Event dots */}
              {(() => {
                // Calculate timeline range and visible events
                const currentTime = getCurrentTime();
                let timelineStartTime: number;
                let timelineEndTime: number;
                let eventsToShow = filteredEvents;
                
                if (progressBarHistoryLength > 0) {
                  // Scale from (current time minus history) to (last event time)
                  timelineStartTime = currentTime - (progressBarHistoryLength * 1000);
                  const timeOffsets = filteredEvents.map(e => e.timeToEvent);
                  const maxOffset = Math.max(...timeOffsets);
                  timelineEndTime = mainEventTime + (maxOffset * 1000);
                  
                  // Filter events that fall within the timeline range
                  eventsToShow = filteredEvents.filter(event => {
                    const eventTime = mainEventTime + (event.timeToEvent * 1000);
                    return eventTime >= timelineStartTime;
                  });
                } else {
                  // Show all events: scale from earliest to latest event
                  const timeOffsets = filteredEvents.map(e => e.timeToEvent);
                  const minOffset = Math.min(...timeOffsets);
                  const maxOffset = Math.max(...timeOffsets);
                  timelineStartTime = mainEventTime + (minOffset * 1000);
                  timelineEndTime = mainEventTime + (maxOffset * 1000);
                }
                
                if (eventsToShow.length <= 1) return null;
                
                const totalTimeRange = timelineEndTime - timelineStartTime;
                if (totalTimeRange <= 0) return null;
                
                return eventsToShow
                  .sort((a, b) => {
                    // Sort by status priority: upcoming (grey) first, then yellow, then blue, then green (last = on top)
                    const getStatusPriority = (event: any) => {
                      if (event.status === 'completed') {
                        return event.isLastCompleted ? 4 : 3; // green = 4, blue = 3
                      }
                      // Check if upcoming event is yellow (within threshold seconds)
                      if (event.status === 'upcoming' && mainEventTime) {
                        const currentTime = getCurrentTime();
                        const eventTargetTime = mainEventTime + (event.timeToEvent * 1000);
                        const remainingTime = Math.max(0, Math.floor((eventTargetTime - currentTime) / 1000));
                        return remainingTime <= imminentThreshold && remainingTime > 0 ? 2 : 1; // yellow = 2, grey = 1
                      }
                      return 1; // grey
                    };
                    return getStatusPriority(a) - getStatusPriority(b);
                  })
                  .map((event) => {
                    // Calculate position based on the actual timeline range
                    const eventTime = mainEventTime + (event.timeToEvent * 1000);
                    const position = (eventTime - timelineStartTime) / totalTimeRange;
                    const leftPercent = Math.max(0, Math.min(100, position * 100));
                    
                    // Determine dot color based on status and remaining time
                    let dotColor = 'bg-slate-400'; // default upcoming
                    
                    if (event.status === 'completed') {
                      dotColor = event.isLastCompleted ? 'bg-green-500' : 'bg-blue-500';
                    } else if (event.status === 'upcoming' && mainEventTime) {
                      // Check if event is within threshold seconds (like event cards do)
                      const currentTime = getCurrentTime();
                      const eventTargetTime = mainEventTime + (event.timeToEvent * 1000);
                      const remainingTime = Math.max(0, Math.floor((eventTargetTime - currentTime) / 1000));
                      
                      if (remainingTime <= imminentThreshold && remainingTime > 0) {
                        dotColor = 'bg-yellow-500'; // imminent (within threshold seconds)
                      }
                    }
                    
                    return (
                      <div
                        key={event.id}
                        className={`absolute w-3 h-3 ${dotColor} rounded-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all duration-1000 ease-linear z-10 ${
                          event.timeToEvent === 0 ? 'ring-2 ring-slate-300' : ''
                        }`}
                        style={{ 
                          left: `${leftPercent}%`
                        }}
                        title={event.title}
                      />
                    );
                  });
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
