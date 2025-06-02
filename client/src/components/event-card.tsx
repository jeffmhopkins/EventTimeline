import { useEffect, useState, useMemo } from "react";
import { Event as EventType } from "@shared/schema";
import { formatTime, getCategoryColor } from "@/lib/event-utils";
import { CheckCircle, Check, Edit, ChevronDown, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainEventDialog } from "@/components/main-event-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface EventCardProps {
  event: EventType;
  isLastCompleted?: boolean;
  onEditEvent: (updatedEvent: EventType) => void;
  getCurrentTime: () => number;
  onSetMainEventTime?: (timestamp: number) => void;
  onUpdateMainEventTitle?: (title: string) => void;
  imminentThreshold?: number;
  globalTime: number;
  availableCategories?: string[];
}

export function EventCard({ event, isLastCompleted, onEditEvent, getCurrentTime, onSetMainEventTime, onUpdateMainEventTitle, imminentThreshold = 5, globalTime, availableCategories = [] }: EventCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearchValue, setCategorySearchValue] = useState('');
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description,
    category: event.category,
    hours: Math.floor(Math.abs(event.timeToEvent) / 3600),
    minutes: Math.floor((Math.abs(event.timeToEvent) % 3600) / 60),
    seconds: Math.abs(event.timeToEvent) % 60,
    timing: event.timeToEvent <= 0 ? 'before' : 'after'
  });

  const handleSaveEdit = () => {
    const totalSeconds = editForm.hours * 3600 + editForm.minutes * 60 + editForm.seconds;
    const updatedEvent: EventType = {
      ...event,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      timeToEvent: editForm.timing === 'before' ? -totalSeconds : totalSeconds
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

  // Use dynamic categories from props or fallback to common defaults
  const categoryList = availableCategories.length > 0 ? availableCategories : ['Launch', 'Mission', 'Technical', 'Communication', 'Safety', 'Recovery'];

  // Calculate remaining time using shared globalTime
  const remainingTime = useMemo(() => {
    if (event.status !== 'upcoming') return 0;
    
    const mainEventTimestamp = (event as any).mainEventTimestamp;
    if (!mainEventTimestamp) return 0;
    
    const eventTargetTime = mainEventTimestamp + (event.timeToEvent * 1000);
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
        <DialogContent 
          className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-slate-200">Edit Event</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Modify the event details and timing relative to the main event
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="col-span-3 border border-slate-300 dark:border-slate-600"
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
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
                  value={editForm.timing} 
                  onValueChange={(value) => setEditForm({...editForm, timing: value})}
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
                  <Label htmlFor="edit-hours" className="text-xs">Hours</Label>
                  <Input
                    id="edit-hours"
                    type="number"
                    min="0"
                    value={editForm.hours}
                    onChange={(e) => setEditForm({...editForm, hours: parseInt(e.target.value) || 0})}
                    className="border border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="edit-minutes" className="text-xs">Minutes</Label>
                  <Input
                    id="edit-minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={editForm.minutes}
                    onChange={(e) => setEditForm({...editForm, minutes: parseInt(e.target.value) || 0})}
                    className="border border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="edit-seconds" className="text-xs">Seconds</Label>
                  <Input
                    id="edit-seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={editForm.seconds}
                    onChange={(e) => setEditForm({...editForm, seconds: parseInt(e.target.value) || 0})}
                    className="border border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <div className="col-span-3">
                <DropdownMenu open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between border border-gray-300 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        {editForm.category ? (
                          categoryList.includes(editForm.category) ? (
                            <span 
                              className="px-2 py-1 rounded text-sm font-medium"
                              style={{
                                backgroundColor: getCategoryColor(editForm.category).bg,
                                borderColor: getCategoryColor(editForm.category).border,
                                color: getCategoryColor(editForm.category).text,
                                border: `1px solid ${getCategoryColor(editForm.category).border}`
                              }}
                            >
                              {editForm.category}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                              {editForm.category}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">Select category...</span>
                        )}
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto border border-gray-300 dark:border-gray-600" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {categoryList.map((cat) => {
                      const colors = getCategoryColor(cat);
                      return (
                        <DropdownMenuItem
                          key={cat}
                          onClick={() => {
                            setEditForm({...editForm, category: cat});
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
                            {editForm.category === cat && (
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
                              setEditForm({...editForm, category: categorySearchValue.trim()});
                              setCategoryOpen(false);
                              setCategorySearchValue('');
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (categorySearchValue.trim()) {
                              setEditForm({...editForm, category: categorySearchValue.trim()});
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
          <div className="flex gap-2">
            <Button 
              onClick={handleDeleteEvent}
              className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white flex items-center justify-center !border-red-600 hover:!border-red-700 font-medium"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
            >
              Delete Event
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditOpen(false)}
              className="flex-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="flex-1">
              Save Changes
            </Button>
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
        mainEventDescription={event.description}
        onSetMainEventTime={onSetMainEventTime || (() => {})}
        onUpdateMainEventTitle={onUpdateMainEventTitle || (() => {})}
        onUpdateMainEventDescription={() => {}}
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
                  const eventTargetTime = mainEventTimestamp + (event.timeToEvent * 1000);
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
            ? 'font-semibold text-slate-600 dark:text-slate-400'
            : 'font-bold text-slate-800 dark:text-slate-200'
        }`}>{event.title}</h3>
        <p className={`text-sm mb-2 ${
          event.status === 'upcoming' 
            ? 'text-slate-600 dark:text-slate-400' 
            : 'text-slate-600 dark:text-slate-400'
        }`}>{event.description}</p>
        {event.category && event.timeToEvent !== 0 && (() => {
          const colorObj = getCategoryColor(event.category);
          return (
            <span 
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1"
              style={{
                backgroundColor: colorObj.bg,
                color: colorObj.text,
                border: `1px solid ${colorObj.border}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              {event.category}
            </span>
          );
        })()}
      </div>
    </div>
  );
}
