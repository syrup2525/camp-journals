export const MAX_HASHTAGS = 20;
export const MAX_HASHTAG_LENGTH = 40;

export function normalizeHashtag(value: string) {
  const tag = value.trim().replace(/^#+/, '').trim();

  if (!tag) {
    return null;
  }

  if (tag.length > MAX_HASHTAG_LENGTH || /\s/.test(tag)) {
    return null;
  }

  return tag;
}

export function normalizeHashtags(values: string[] = []) {
  const seen = new Set<string>();
  const tags: string[] = [];

  values.forEach((value) => {
    const tag = normalizeHashtag(value);

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

