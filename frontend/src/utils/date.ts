import type { Journal } from '../types/journal';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateKo(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

export function formatDateTimeKo(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

export function toDateInputValue(value?: string) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export function sortByCampingDateDesc(journals: Journal[]) {
  return [...journals].sort((a, b) => {
    const left = new Date(a.campingDate).getTime();
    const right = new Date(b.campingDate).getTime();
    return right - left;
  });
}

