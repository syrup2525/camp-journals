export const MAX_HASHTAGS = 20;

export function normalizeHashtag(value: string) {
  const tag = value.trim().replace(/^#+/, '').trim();

  if (!tag || /\s/.test(tag)) {
    return null;
  }

  return tag;
}

export function parseHashtagText(value: string) {
  const seen = new Set<string>();
  const tags: string[] = [];

  value
    .split(/[,\s]+/)
    .map(normalizeHashtag)
    .forEach((tag) => {
      if (!tag) {
        return;
      }

      const key = tag.toLocaleLowerCase('ko-KR');
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      tags.push(tag);
    });

  return tags.slice(0, MAX_HASHTAGS);
}

export function formatHashtags(hashtags: string[]) {
  return hashtags.map((tag) => `#${tag}`).join(' ');
}

