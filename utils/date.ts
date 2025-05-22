export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const addWorkDays = (dateString: string, workDays: number): string => {
  const date = new Date(dateString);
  let daysAdded = 0;
  let currentDate = new Date(date);
  
  while (daysAdded < workDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return currentDate.toISOString();
};

export const getDaysBetween = (startDateString: string, endDateString: string): number => {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getWorkDaysBetween = (startDateString: string, endDateString: string): number => {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  
  // Ensure start date is before end date
  if (startDate > endDate) return 0;
  
  // Set to start of day to avoid time issues
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  let workDays = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Check if it's a weekday (1-5 are Monday to Friday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workDays;
};

export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

export const getFormattedDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};