import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function shouldNormalizeCaps(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false

  const lettersOnly = trimmed.replace(/[^A-Za-z]+/g, "")
  return lettersOnly.length > 1 && lettersOnly === lettersOnly.toUpperCase()
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
}

function toSentenceCase(value: string) {
  const lowerCased = value.toLowerCase()
  return lowerCased.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) => match.toUpperCase())
}

export function normalizeDisplayCase(
  value: string,
  mode: "title" | "sentence" = "sentence",
) {
  if (!shouldNormalizeCaps(value)) {
    // If not all caps, still apply the requested case transformation
    return mode === "title" ? toTitleCase(value) : toSentenceCase(value)
  }

  return mode === "title" ? toTitleCase(value.trim()) : toSentenceCase(value.trim())
}

export function parseCurrencyAmount(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0

  const matchedNumber = trimmed.match(/\d[\d,]*(?:\.\d+)?/)
  if (!matchedNumber) return 0

  return Number(matchedNumber[0].replace(/,/g, "")) || 0
}
