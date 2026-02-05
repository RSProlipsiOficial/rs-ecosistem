import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um texto para Pascal Case (Primeira letra de cada palavra em maiúscula)
 * e remove espaços extras.
 */
export function formatToPascalCase(text: string): string {
  if (!text) return "";

  // Lista de preposições que devem ficar em minúsculo (opcional, mas comum em nomes)
  const exceptions = ["de", "do", "da", "dos", "das", "e"];

  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      if (exceptions.includes(word) && index !== 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
