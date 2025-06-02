import { useState, useEffect, useCallback } from "react";
import { Event as EventType } from "@shared/schema";
import { generateRandomEvents as generateEvents, getCategoryColor } from "@/lib/event-utils";

const STORAGE_KEY = 'eventTimeline';

export function useEvents(getCurrentTime?: () => number, imminentThreshold: number = 5) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);
  
  // Use provided getCurrentTime function or default to Date.now
  const getTime = getCurrentTime || (() => Date.now());

  // Check for cached data first, otherwise start fresh
  useEffect(() => {
    const cacheEnabled = localStorage.getItem('cacheDataLocally') === 'true';
    const cachedData = localStorage.getItem('timelineAppData');
    
    if (cacheEnabled && cachedData) {
      try {
        const data = JSON.parse(cachedData);
        
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
          return; // Don't initialize main event if we have cached data
        }
      } catch (e) {
        console.warn('Failed to restore cached events:', e);
      }
    }
    // If no cached data or cache disabled, start fresh
    localStorage.removeItem(STORAGE_KEY);
    initializeMainEvent();
  }, []);

  const initializeMainEvent = () => {
    const currentTime = getTime();
    const mainEventTimestamp = currentTime + (3 * 60 * 60 * 1000); // 3 hours from now
    
    const formatTimeForCategory = (timestamp: number) => {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    };

    const mainEvent = {
      id: `${Date.now()}-main`,
      title: 'Main Event',
      description: 'The primary event everything leads up to',
      category: formatTimeForCategory(mainEventTimestamp), // Store main event time in HH:MM:SS format
      timeToEvent: 0, // 0 seconds before main event
      createdAt: currentTime,
      status: 'upcoming' as const,
      mainEventTimestamp: mainEventTimestamp
    };
    
    setEvents([mainEvent]);
  };

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  // Cleanup function to ensure all events have unique IDs
  const ensureUniqueIds = useCallback((events: EventType[]) => {
    const seenIds = new Set<string>();
    return events.map(event => {
      if (seenIds.has(event.id)) {
        // Generate new unique ID for duplicate
        const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        seenIds.add(newId);
        return { ...event, id: newId };
      }
      seenIds.add(event.id);
      return event;
    });
  }, []);

  // Update events and check for completed ones
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = getTime();
      let hasChanges = false;
      let newLastCompletedId = lastCompletedId;

      setEvents(prevEvents => {
        // First ensure all events have unique IDs
        const uniqueEvents = ensureUniqueIds(prevEvents);
        if (uniqueEvents.length === 0) return uniqueEvents;

        // Get the main event timestamp from any event (they all have the same one)
        const mainEventTimestamp = (uniqueEvents[0] as any).mainEventTimestamp;
        if (!mainEventTimestamp) return uniqueEvents;
        
        const updatedEvents = uniqueEvents.map(event => {
          if (event.status === 'upcoming') {
            // Calculate when this specific event should complete
            // With negative timeToEvent: mainEventTimestamp + (timeToEvent * 1000)
            // Example: main event at 1000, event with timeToEvent -60 completes at 1000 + (-60 * 1000) = 940
            const eventTargetTime = mainEventTimestamp + (event.timeToEvent * 1000);
            
            if (currentTime >= eventTargetTime - 1000) { // Complete 1 second earlier to sync with display
              hasChanges = true;
              return {
                ...event,
                status: 'completed' as const,
                completedAt: currentTime
              };
            }
          }
          return event;
        });

        if (hasChanges) {
          // Find the completed event closest to the main event (smallest timeToEvent)
          const completedEvents = updatedEvents.filter(e => e.status === 'completed');
          if (completedEvents.length > 0) {
            const closestToMain = completedEvents.reduce((closest, event) => 
              Math.abs(event.timeToEvent) < Math.abs(closest.timeToEvent) ? event : closest
            );
            setLastCompletedId(closestToMain.id);
          }
        }

        return updatedEvents;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [lastCompletedId, getTime]);

  const generateRandomEvents = useCallback(() => {
    const newEvents = generateEvents();
    setEvents(newEvents);
    setLastCompletedId(null);
  }, []);

  const deleteAllEvents = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    initializeMainEvent();
    setLastCompletedId(null);
  }, []);

  const resetToMainEventOnly = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    initializeMainEvent();
    setLastCompletedId(null);
  }, []);

  const setMainEventTime = useCallback((timestamp: number) => {
    const formatTimeForCategory = (timestamp: number) => {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    };

    setEvents(prevEvents => {
      const currentTime = getTime();
      
      // Update all events with new main event timestamp and recalculate statuses
      return prevEvents.map(event => {
        const eventTargetTime = timestamp - (event.timeToEvent * 1000);
        const status = currentTime >= eventTargetTime ? 'completed' : 'upcoming';
        
        return {
          ...event,
          mainEventTimestamp: timestamp,
          // Update category field with HH:MM:SS format for main event (timeToEvent === 0)
          category: event.timeToEvent === 0 ? formatTimeForCategory(timestamp) : event.category,
          status,
          completedAt: status === 'completed' ? eventTargetTime : undefined
        };
      });
    });
    
    // Reset last completed tracking since statuses changed
    setLastCompletedId(null);
  }, [getTime]);

  const updateMainEventTitle = useCallback((title: string) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.timeToEvent === 0) {
          return { ...event, title };
        }
        return event;
      });
    });
  }, []);

  const updateMainEventDescription = useCallback((description: string) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.timeToEvent === 0) {
          return { ...event, description };
        }
        return event;
      });
    });
  }, []);

  const updateEvent = useCallback((eventId: string, updatedEvent: EventType) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId) {
          // Preserve the mainEventTimestamp and recalculate status
          const mainEventTimestamp = (event as any).mainEventTimestamp;
          const currentTime = Date.now();
          const eventTargetTime = mainEventTimestamp - (updatedEvent.timeToEvent * 1000);
          
          return {
            ...updatedEvent,
            id: eventId, // Keep the original ID
            mainEventTimestamp,
            status: currentTime >= eventTargetTime ? 'completed' : 'upcoming',
            completedAt: currentTime >= eventTargetTime ? eventTargetTime : undefined
          };
        }
        return event;
      });
    });
  }, []);

  const addEvent = useCallback((title: string, description: string, category: string, timeToEvent: number) => {
    // Pre-assign color to new category to ensure it gets a random color
    if (category.trim()) {
      getCategoryColor(category.trim());
    }
    
    setEvents(prevEvents => {
      if (prevEvents.length === 0) return prevEvents;
      
      // Get main event timestamp from existing events
      const mainEventTimestamp = (prevEvents[0] as any).mainEventTimestamp;
      const currentTime = getTime();
      
      // Generate unique ID using timestamp + random suffix to prevent duplicates
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate status based on main event time and offset
      const eventTargetTime = mainEventTimestamp + (timeToEvent * 1000);
      const status = currentTime >= eventTargetTime ? 'completed' : 'upcoming';
      
      const newEvent: EventType = {
        id: uniqueId,
        title,
        description,
        category,
        timeToEvent,
        createdAt: currentTime,
        status,
        completedAt: status === 'completed' ? eventTargetTime : undefined,
        mainEventTimestamp
      };
      
      return [...prevEvents, newEvent];
    });
  }, [getTime]);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  }, []);

  const importEvents = useCallback((newEvents: { title: string; description: string; category: string; timeToEvent: number }[]) => {
    setEvents(prevEvents => {
      const currentTime = getTime();
      const mainEventTimestamp = prevEvents.find(e => e.timeToEvent === 0)?.mainEventTimestamp || currentTime + (3 * 60 * 60 * 1000);
      
      const importedEvents = newEvents.map(eventData => {
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const eventTargetTime = mainEventTimestamp + (eventData.timeToEvent * 1000);
        const status = currentTime >= eventTargetTime ? 'completed' : 'upcoming';
        
        return {
          id: uniqueId,
          title: eventData.title,
          description: eventData.description,
          category: eventData.category,
          timeToEvent: eventData.timeToEvent,
          createdAt: currentTime,
          status,
          completedAt: status === 'completed' ? eventTargetTime : undefined,
          mainEventTimestamp
        } as EventType;
      });
      
      // Keep existing main event, add imported events
      return [...prevEvents.filter(e => e.timeToEvent === 0), ...importedEvents];
    });
  }, [getTime]);

  // Sort events by timeToEvent (with negative values: earliest events first, main event last)
  const sortedEvents = [...events].sort((a, b) => {
    return a.timeToEvent - b.timeToEvent;
  });

  // Add isLastCompleted flag to events - highlight all events that completed at the same time as the most recent
  const lastCompletedEvent = events.find(e => e.id === lastCompletedId);
  const lastCompletedTime = lastCompletedEvent?.timeToEvent;
  
  const eventsWithFlags = sortedEvents.map(event => ({
    ...event,
    isLastCompleted: event.status === 'completed' && 
                    lastCompletedTime !== undefined && 
                    event.timeToEvent === lastCompletedTime
  }));

  // Find the main event (event with timeToEvent = 0)
  const mainEvent = events.find(event => event.timeToEvent === 0) || null;
  
  const mainEventTime = events.length > 0 ? (events[0] as any).mainEventTimestamp : undefined;

  return {
    events,
    sortedEvents: eventsWithFlags,
    generateRandomEvents,
    deleteAllEvents,
    setMainEventTime,
    updateMainEventTitle,
    updateMainEventDescription,
    updateEvent,
    addEvent,
    deleteEvent,
    importEvents,
    lastCompletedId,
    mainEventTime,
    mainEvent
  };
}
