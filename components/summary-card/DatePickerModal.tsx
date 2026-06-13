'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  availableDates: string[]; // ISO date strings "YYYY-MM-DD"
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelectDate,
  availableDates,
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Convert available dates to a Set for O(1) lookup
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  // Auto-select today if it has matches
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const defaultSelected = availableDateSet.has(todayStr) ? todayStr : null;
  const activeSelection = selectedDate ?? defaultSelected;

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!availableDateSet.has(dateStr)) return;
    setSelectedDate(dateStr);
  };

  const handleConfirm = () => {
    if (activeSelection) {
      onSelectDate(activeSelection);
      onClose();
    }
  };

  const hasNoDates = availableDates.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#111827] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Select Match Date
          </DialogTitle>
        </DialogHeader>

        {hasNoDates ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarX className="w-12 h-12 text-slate-500 mb-4" />
            <p className="text-slate-400 text-sm">
              No match history available to generate a summary card.
            </p>
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-base font-semibold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-slate-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasMatch = availableDateSet.has(dateStr);
                const isSelected = activeSelection === dateStr;
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    disabled={!hasMatch || !isCurrentMonth}
                    className={cn(
                      'relative w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                      // Base states
                      !isCurrentMonth && 'opacity-20 cursor-default',
                      isCurrentMonth && !hasMatch && 'text-slate-600 opacity-40 cursor-not-allowed',
                      // Match day (enabled)
                      isCurrentMonth && hasMatch && !isSelected &&
                        'text-white cursor-pointer hover:bg-emerald-500/20 hover:ring-1 hover:ring-emerald-500/40',
                      // Selected day
                      isSelected &&
                        'bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/30',
                      // Today indicator
                      isTodayDate && !isSelected && isCurrentMonth &&
                        'ring-1 ring-emerald-500/50'
                    )}
                  >
                    {format(day, 'd')}
                    {/* Match indicator dot */}
                    {hasMatch && isCurrentMonth && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected date info */}
            {activeSelection && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                  <span className="font-medium">Selected:</span>{' '}
                  {format(parseISO(activeSelection), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!activeSelection}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Generate Summary
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
