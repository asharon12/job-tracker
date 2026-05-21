import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import { useState } from 'react';
import { useApplications } from '../hooks/useApplications';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } });

interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

export default function CalendarPage() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const { data } = useApplications({ limit: 100 });
  const apps = data?.data ?? [];

  const events: CalEvent[] = [];

  for (const app of apps) {
    if (app.deadlineDate) {
      const d = new Date(app.deadlineDate);
      events.push({
        id: `deadline-${app.id}`,
        title: `⏰ ${app.companyName} deadline`,
        start: d, end: d,
        color: '#ff6b6b',
      });
    }
    for (const round of app.interviewRounds) {
      if (round.scheduledDate) {
        const d = new Date(round.scheduledDate);
        events.push({
          id: `round-${round.id}`,
          title: `📅 ${app.companyName} — ${round.roundType.replace(/_/g, ' ')}`,
          start: d, end: d,
          color: '#6c63ff',
        });
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Calendar</h1>
      <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-4 calendar-dark" style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: (event as CalEvent).color,
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              padding: '2px 6px',
            },
          })}
          style={{ height: '100%' }}
        />
      </div>
      <style>{`
        .calendar-dark .rbc-calendar { background: transparent; color: #e8eaf0; }
        .calendar-dark .rbc-header { background: #21253a; border-color: #2e3248; padding: 8px; font-size: 12px; color: #8b90a7; }
        .calendar-dark .rbc-month-view, .calendar-dark .rbc-time-view { border-color: #2e3248; }
        .calendar-dark .rbc-day-bg { border-color: #2e3248; }
        .calendar-dark .rbc-off-range-bg { background: #0f1117; }
        .calendar-dark .rbc-today { background: #6c63ff10; }
        .calendar-dark .rbc-date-cell { padding: 4px 8px; font-size: 12px; color: #8b90a7; }
        .calendar-dark .rbc-date-cell.rbc-now { color: #6c63ff; font-weight: 700; }
        .calendar-dark .rbc-toolbar { margin-bottom: 16px; gap: 8px; }
        .calendar-dark .rbc-toolbar button { background: #21253a; border: 1px solid #2e3248; color: #8b90a7; border-radius: 8px; padding: 6px 14px; font-size: 13px; cursor: pointer; }
        .calendar-dark .rbc-toolbar button:hover { background: #2e3248; color: white; }
        .calendar-dark .rbc-toolbar button.rbc-active { background: #6c63ff; border-color: #6c63ff; color: white; }
        .calendar-dark .rbc-toolbar-label { font-size: 15px; font-weight: 600; color: white; }
        .calendar-dark .rbc-show-more { color: #6c63ff; background: transparent; font-size: 11px; }
      `}</style>
    </div>
  );
}
