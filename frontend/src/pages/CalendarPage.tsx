import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import { useState } from 'react';
import { useApplications } from '../hooks/useApplications';
import { useThemeStore } from '../store/theme.store';
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
  const { isDark } = useThemeStore();
  const apps = data?.data ?? [];

  const events: CalEvent[] = [];

  for (const app of apps) {
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

  const bgSurface = isDark ? '#1a1d27' : '#ffffff';
  const bgElevated = isDark ? '#21253a' : '#e8e8ff';
  const bgBase = isDark ? '#0f1117' : '#f0f0ff';
  const border = isDark ? '#2e3248' : '#d4d4f0';
  const text = isDark ? '#e8eaf0' : '#111827';
  const textMuted = isDark ? '#8b90a7' : '#5b6278';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[var(--text)]">Calendar</h1>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4" style={{ height: 600 }}>
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
        .rbc-calendar { background: transparent; color: ${text}; }
        .rbc-header { background: ${bgElevated}; border-color: ${border}; padding: 8px; font-size: 12px; color: ${textMuted}; }
        .rbc-month-view, .rbc-time-view { border-color: ${border}; }
        .rbc-day-bg { border-color: ${border}; }
        .rbc-off-range-bg { background: ${bgBase}; }
        .rbc-today { background: #6c63ff10; }
        .rbc-date-cell { padding: 4px 8px; font-size: 12px; color: ${textMuted}; }
        .rbc-date-cell.rbc-now { color: #6c63ff; font-weight: 700; }
        .rbc-toolbar { margin-bottom: 16px; gap: 8px; }
        .rbc-toolbar button { background: ${bgElevated}; border: 1px solid ${border}; color: ${textMuted}; border-radius: 8px; padding: 6px 14px; font-size: 13px; cursor: pointer; }
        .rbc-toolbar button:hover { background: ${bgSurface}; color: ${text}; }
        .rbc-toolbar button.rbc-active { background: #6c63ff; border-color: #6c63ff; color: white; }
        .rbc-toolbar-label { font-size: 15px; font-weight: 600; color: ${text}; }
        .rbc-show-more { color: #6c63ff; background: transparent; font-size: 11px; }
      `}</style>
    </div>
  );
}
