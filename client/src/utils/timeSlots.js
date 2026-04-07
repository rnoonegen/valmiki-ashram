import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_ZONE = 'Asia/Kolkata';
const BASE_DATE = '2026-01-01';

function formatHour(hour24) {
  return dayjs(`${BASE_DATE}T${String(hour24).padStart(2, '0')}:00:00`)
    .format('hh:mm A');
}

export const IST_TIME_SLOTS = Array.from({ length: 24 }, (_, hour) => {
  const start = formatHour(hour);
  const end = dayjs(`${BASE_DATE}T${String(hour).padStart(2, '0')}:00:00`)
    .add(45, 'minute')
    .format('hh:mm A');
  const label = `${start} - ${end}`;

  return { value: label, label };
});

export function convertIstSlotToTimezone(slotLabel, targetTimezone) {
  if (!slotLabel || !targetTimezone) return '';
  const [startRaw, endRaw] = slotLabel.split(' - ');
  if (!startRaw || !endRaw) return '';

  const parseInIst = (timeStr) =>
    dayjs.tz(`${BASE_DATE} ${timeStr}`, 'YYYY-MM-DD hh:mm A', IST_ZONE);

  const localStart = parseInIst(startRaw).tz(targetTimezone);
  const localEnd = parseInIst(endRaw).tz(targetTimezone);

  return `${localStart.format('hh:mm A')} - ${localEnd.format('hh:mm A')}`;
}

