const singaporeTimeZone = 'Asia/Singapore';

function safeDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatSingaporeTime(value?: string) {
  const date = safeDate(value);
  if (!date) return value ?? '—';
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: singaporeTimeZone,
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function formatSingaporeDateTime(value?: string) {
  const date = safeDate(value);
  if (!date) return value ?? '—';
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: singaporeTimeZone,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}
