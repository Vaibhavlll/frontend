import { formatDistanceToNow, parseISO } from 'date-fns';

export const getRelativeTime = (timestamp: string): string => {
  try {
    const date = parseISO(timestamp);
    // Add IST offset (UTC+5:30)
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    
    return formatDistanceToNow(istDate, { 
      addSuffix: false,
      includeSeconds: false
    });
  } catch (error) {
    console.error('Error parsing date:', error);
    return timestamp;
  }
};