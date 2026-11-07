/** Encode raw text without trimming or changing its original line endings. */
export function textToJsonString(text: string): string {
  return JSON.stringify(text);
}

export function textToJsonObject(text: string, propertyName = 'lyrics'): string {
  return JSON.stringify({ [propertyName]: text }, null, 2);
}
