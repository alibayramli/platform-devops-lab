type EnumLabelOptions = {
  capitalize?: boolean;
};

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatShortDate(value: string | Date): string {
  return shortDateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatEnumLabel(value: string, options: EnumLabelOptions = {}): string {
  const normalized = value.replace(/_/g, " ");

  if (options.capitalize === false) {
    return normalized;
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getInitials(value: string | null | undefined, fallback = "NA"): string {
  if (!value?.trim()) {
    return fallback;
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
