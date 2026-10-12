export interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number; // 1 - 31
  dayOfWeek: string; // 'M', 'T', 'W', etc. or 'Mon'
  fullDayName: string; // 'Monday'
  isToday: boolean;
  isWeekend: boolean;
  isFuture: boolean;
}

export function formatDateStr(year: number, month: number, day: number): string {
  const y = year.toString();
  const m = (month + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysForMonth(year: number, month: number, todayOverride?: Date): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Use the caller-supplied today (from state) so isToday is always accurate
  const today = todayOverride ?? new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const days: CalendarDay[] = [];
  const dayNamesShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const dayOfWeekIdx = currentDate.getDay();
    const dateStr = formatDateStr(year, month, d);
    const isToday = dateStr === todayStr;
    const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;
    // Compare against start-of-today so cells earlier today aren't wrongly marked future
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isFuture = currentDate > startOfToday && !isToday;

    days.push({
      date: currentDate,
      dateStr,
      dayNumber: d,
      dayOfWeek: dayNamesShort[dayOfWeekIdx],
      fullDayName: fullDayNames[dayOfWeekIdx],
      isToday,
      isWeekend,
      isFuture,
    });
  }

  return days;
}


export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

// Calculate streak up to today or month end
export function calculateHabitStreak(completions: Record<string, boolean>): { current: number; longest: number } {
  const today = new Date();
  const checkDate = new Date(today);
  
  let current = 0;
  // Check today first, if not completed, check if yesterday was completed
  const todayStr = formatDateStr(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  if (completions[todayStr]) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If not completed today, maybe completed yesterday?
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = formatDateStr(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    if (completions[dStr]) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak from all recorded dates
  const sortedDates = Object.keys(completions)
    .filter(k => completions[k])
    .sort();

  let longest = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const parts = dStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    if (tempStreak > longest) {
      longest = tempStreak;
    }
    prevDate = d;
  }

  if (current > longest) longest = current;

  return { current, longest };
}
