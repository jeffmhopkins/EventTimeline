import { useEffect, useState, useMemo } from "react";
import { Event as EventType } from "@shared/schema";
import { formatTime, getCategoryColor } from "@/lib/event-utils";
import { CheckCircle, Check, Edit, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainEventDialog } from "@/components/main-event-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EventCardProps {
  event: EventType;
  isLastCompleted?: boolean;
  onEditEvent: (updatedEvent: EventType) => void;
  getCurrentTime: () => number;
  onSetMainEventTime?: (timestamp: number) => void;
  onUpdateMainEventTitle?: (title: string) => void;
  imminentThreshold?: number;
  globalTime: number;
}

export function EventCard({ event, isLastCompleted, onEditEvent, getCurrentTime, onSetMainEventTime, onUpdateMainEventTitle, imminentThreshold = 5, globalTime }: EventCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description,
    category: event.category,
    hours: Math.floor(Math.abs(event.timeToEvent) / 3600),
    minutes: Math.floor((Math.abs(event.timeToEvent) % 3600) / 60),
    seconds: Math.abs(event.timeToEvent) % 60
  });

  const handleSaveEdit = () => {
    const totalSeconds = editForm.hours * 3600 + editForm.minutes * 60 + editForm.seconds;
    const updatedEvent: EventType = {
      ...event,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      timeToEvent: totalSeconds
    };
    onEditEvent(updatedEvent);
    setIsEditOpen(false);
  };

  const handleDeleteEvent = () => {
    // Signal deletion by passing the deletion flag to the edit handler
    onEditEvent({ ...event, _deleted: true } as any);
    setIsEditOpen(false);
  };

  const handleOpenTimeDialog = () => {
    setIsTimeDialogOpen(true);
  };

  const availableCategories = ['Launch', 'Mission', 'Technical', 'Communication', 'Safety', 'Recovery'];

  // Calculate remaining time using shared globalTime
  const remainingTime = useMemo(() => {
    if (event.status !== 'upcoming') return 0;
    
    const mainEventTimestamp = (event as any).mainEventTimestamp;
    if (!mainEventTimestamp) return 0;
    
    const eventTargetTime = mainEventTimestamp - (event.timeToEvent * 1000);
    return Math.max(0, Math.floor((eventTargetTime - globalTime) / 1000));
  }, [event, globalTime]);

  let statusClasses = 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800';
  let statusIndicator = null;
  let borderThickness = 'border';

  if (event.status === 'completed') {
    if (isLastCompleted) {
      // Last completed event - light green background
      statusClasses = 'border-green-300 bg-green-100 dark:border-green-600 dark:bg-green-900/20';
      borderThickness = 'border-2';
      statusIndicator = (
        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium mb-2">
          <CheckCircle className="w-4 h-4 mr-2" />
          Recently Completed
        </div>
      );
    } else {
      // Other completed events - light blue background
      statusClasses = 'border-blue-300 bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20';
      borderThickness = 'border-2';
      statusIndicator = (
        <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm mb-2">
          <Check className="w-4 h-4 mr-2" />
          Completed
        </div>
      );
    }
  } else if (event.status === 'upcoming' && remainingTime <= imminentThreshold && remainingTime > 0) {
    // Events within threshold seconds of completion - light yellow background
    statusClasses = 'border-yellow-300 bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-900/20';
    borderThickness = 'border-2';
  }

  // Main event gets extra thick border with dynamic colors
  if (event.timeToEvent === 0) {
    borderThickness = 'border-4';
    if (event.status === 'completed' && isLastCompleted) {
      statusClasses = 'bg-green-50 dark:bg-green-900/30 main-event-completed';
    } else if (event.status === 'completed') {
      statusClasses = 'bg-blue-50 dark:bg-blue-900/30 main-event-completed';
    } else if (event.status === 'upcoming' && remainingTime <= imminentThreshold && remainingTime > 0) {
      statusClasses = 'border-yellow-400 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-900/30';
    } else {
      statusClasses = 'border-purple-700 bg-slate-50 dark:border-purple-400 dark:bg-slate-700';
    }
  }

  return (
    <div 
      className={`${borderThickness} ${statusClasses} rounded-lg px-6 py-3 transition-all duration-300 relative ${
        isLastCompleted ? 'z-20' : 
        (event.status === 'upcoming' && remainingTime <= imminentThreshold && remainingTime > 0) ? 'z-20' : 
        'z-0'
      }`}
      style={event.timeToEvent === 0 ? { 
        borderColor: '#7c3aed', 
        borderWidth: '4px',
        borderStyle: 'solid'
      } : {}}
      data-event-id={event.id}
    >
      {/* Edit button in top-right corner */}
      {event.timeToEvent === 0 ? (
        // Main event - open time dialog
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400"
          onClick={handleOpenTimeDialog}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ) : (
        // Regular event - open edit dialog
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300">Time before main event</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="hours" className="text-xs text-slate-600 dark:text-slate-400">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    value={editForm.hours}
                    onChange={(e) => setEditForm({...editForm, hours: parseInt(e.target.value) || 0})}
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="minutes" className="text-xs text-slate-600 dark:text-slate-400">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={editForm.minutes}
                    onChange={(e) => setEditForm({...editForm, minutes: parseInt(e.target.value) || 0})}
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="seconds" className="text-xs text-slate-600 dark:text-slate-400">Seconds</Label>
                  <Input
                    id="seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={editForm.seconds}
                    onChange={(e) => setEditForm({...editForm, seconds: parseInt(e.target.value) || 0})}
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">Category</Label>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    {editForm.category || "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                  <Command>
                    <CommandInput placeholder="Search or type category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {availableCategories.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={(currentValue) => {
                              setEditForm({...editForm, category: currentValue});
                              setCategoryOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                editForm.category === cat ? "opacity-100" : "opacity-0"
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
                value={editForm.category}
                onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              onClick={handleDeleteEvent}
              className="!bg-red-600 hover:!bg-red-700 !text-white flex items-center gap-2 !border-red-600 hover:!border-red-700 font-medium"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
            >
              <X className="w-4 h-4" />
              Delete Event
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      )}

      {/* Main Event Edit Dialog */}
      <MainEventDialog
        open={isTimeDialogOpen}
        onOpenChange={setIsTimeDialogOpen}
        mainEventTime={(event as any).mainEventTimestamp}
        mainEventTitle={event.title}
        onSetMainEventTime={onSetMainEventTime || (() => {})}
        onUpdateMainEventTitle={onUpdateMainEventTitle || (() => {})}
        darkMode={document.documentElement.classList.contains('dark')}
      />

      <div className="flex-1 pr-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-base font-mono font-semibold text-slate-700 dark:text-slate-300">
            {formatTime(event.timeToEvent)}
          </div>
          <div className="text-slate-400 dark:text-slate-500">•</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            {event.status === 'upcoming' ? (
              remainingTime > 3600 ? 
                `Upcoming in ${Math.floor(remainingTime / 3600)}h ${Math.floor((remainingTime % 3600) / 60)}m ${remainingTime % 60}s` :
                remainingTime > 60 ? 
                `Upcoming in ${Math.floor(remainingTime / 60)}m ${remainingTime % 60}s` :
                `Upcoming in ${remainingTime}s`
            ) : event.status === 'completed' ? (
              (() => {
                const currentTime = getCurrentTime();
                const mainEventTimestamp = (event as any).mainEventTimestamp;
                if (mainEventTimestamp) {
                  const eventTargetTime = mainEventTimestamp - (event.timeToEvent * 1000);
                  const timeSinceCompletion = Math.max(0, Math.floor((currentTime - eventTargetTime) / 1000) + 1);
                  
                  if (timeSinceCompletion > 3600) {
                    const hours = Math.floor(timeSinceCompletion / 3600);
                    const minutes = Math.floor((timeSinceCompletion % 3600) / 60);
                    const seconds = timeSinceCompletion % 60;
                    return `Completed ${hours}h ${minutes}m ${seconds}s ago`;
                  } else if (timeSinceCompletion > 60) {
                    const minutes = Math.floor(timeSinceCompletion / 60);
                    const seconds = timeSinceCompletion % 60;
                    return `Completed ${minutes}m ${seconds}s ago`;
                  } else {
                    return `Completed ${timeSinceCompletion}s ago`;
                  }
                }
                return 'Completed';
              })()
            ) : (
              'Completed'
            )}
          </div>
        </div>
        <h3 className={`text-base mb-1 ${
          event.timeToEvent === 0
            ? event.status === 'completed' && isLastCompleted
              ? 'font-bold text-green-600 dark:text-green-400'
              : event.status === 'completed'
              ? 'font-bold text-blue-600 dark:text-blue-400'
              : event.status === 'upcoming' && remainingTime <= imminentThreshold && remainingTime > 0
              ? 'font-bold text-yellow-600 dark:text-yellow-400'
              : 'font-bold text-purple-700 dark:text-purple-400'
            : event.status === 'completed' && isLastCompleted
            ? 'font-bold text-green-600 dark:text-green-400'
            : event.status === 'completed'
            ? 'font-bold text-blue-600 dark:text-blue-400'
            : event.status === 'upcoming' && remainingTime <= imminentThreshold && remainingTime > 0
            ? 'font-bold text-yellow-600 dark:text-yellow-400'
            : event.status === 'upcoming'
            ? 'font-semibold text-slate-500 dark:text-slate-500'
            : 'font-bold text-slate-800 dark:text-slate-200'
        }`}>{event.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
        {event.category && (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)} mt-1`}>
            {event.category}
          </span>
        )}
      </div>
    </div>
  );
}
