import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanHtmlText(text: string | null | undefined): string {
  if (!text) return "";

  let cleaned = text;

  const namedEntities: { [key: string]: string } = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  cleaned = cleaned
    .replace(/&amp;#(\d+);/g, (_, num) => {
      const charCode = parseInt(num, 10);
      return String.fromCharCode(charCode);
    })
    .replace(/&amp;#x([0-9A-Fa-f]+);/g, (_, hex) => {
      const charCode = parseInt(hex, 16);
      if (hex.toLowerCase() === 'a' || hex.toLowerCase() === '0a') {
        return '\n';
      }
      return String.fromCharCode(charCode);
    });

  for (const [entity, char] of Object.entries(namedEntities)) {
    cleaned = cleaned.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
    cleaned = cleaned.replace(new RegExp('&amp;' + entity.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char);
  }

  cleaned = cleaned
    .replace(/&#(\d+);/g, (_, num) => {
      const charCode = parseInt(num, 10);
      return String.fromCharCode(charCode);
    })
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
      const charCode = parseInt(hex, 16);
      if (hex.toLowerCase() === 'a' || hex.toLowerCase() === '0a') {
        return '\n';
      }
      return String.fromCharCode(charCode);
    })
    .replace(/&amp;/g, '&');

  cleaned = cleaned
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  return cleaned;
}
