import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return d.toLocaleDateString();
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getCategoryColor(categoryId: number | null): string {
  if (!categoryId) return "blue";
  
  const colors = {
    1: "green", // Product Ideas
    2: "blue",  // Business
    3: "purple", // Creative
    4: "indigo", // Personal
  };
  
  return colors[categoryId as keyof typeof colors] || "blue";
}

export function getCategoryName(categoryId: number | null): string {
  if (!categoryId) return "Uncategorized";
  
  const categories = {
    1: "Product Idea",
    2: "Business",
    3: "Creative",
    4: "Personal",
  };
  
  return categories[categoryId as keyof typeof categories] || "Uncategorized";
}

export function getStatusInfo(status: string) {
  switch (status) {
    case "completed":
      return { color: "green", label: "Completed" };
    case "in_progress":
      return { color: "yellow", label: "In Progress" };
    default:
      return { color: "gray", label: "New" };
  }
}
