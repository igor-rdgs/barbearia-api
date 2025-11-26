import { set, parseISO, isBefore, isAfter } from 'date-fns';

export const timeUtils = {
  createDateTime: (dateStr, timeStr) => {
    const date = parseISO(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return set(date, { hours, minutes, seconds: 0 });
  },

  hasOverlap: (startA, endA, startB, endB) =>
    (isBefore(startA, endB) && isAfter(endA, startB)) ||
    (isBefore(startB, endA) && isAfter(endB, startA)),
};
