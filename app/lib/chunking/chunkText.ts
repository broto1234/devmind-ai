export function chunkText(
  text: string,
  chunkSize: number,
  overlap: number,
) {
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }

  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error(
      "overlap must be >= 0 and less than chunkSize",
    );
  }

  if (text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];

  const step = chunkSize - overlap;

  for (let start = 0; start < text.length; start += step) {
    const chunk = text.slice(start, start + chunkSize);

    chunks.push(chunk);

    if (start + chunkSize >= text.length) {
      break;
    }
  }

  return chunks;
}