import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatta la data in italiano
export function formatDate(date: Date | string) {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Calcola i giorni rimanenti tra due date
export function calculateDaysRemaining(targetDate: Date | string) {
  if (!targetDate) return 0;
  
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const today = new Date();
  
  // Reset delle ore per avere giorni completi
  today.setHours(0, 0, 0, 0);
  const targetCopy = new Date(target);
  targetCopy.setHours(0, 0, 0, 0);
  
  const differenceMs = targetCopy.getTime() - today.getTime();
  const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  
  return differenceDays > 0 ? differenceDays : 0;
}

// Formatta il tempo in ore e minuti
export function formatTime(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Calcola la percentuale da visualizzare
export function calculatePercentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
