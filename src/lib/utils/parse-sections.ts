/**
 * Parse compatibility scores from streamed AI text.
 * Looks for patterns like "종합 궁합 점수: 72" and individual dimension scores.
 */
export function parseCompatibilityScores(
  text: string,
): { total: number; dimensions: { label: string; value: number }[] } | null {
  if (!text) return null;

  // Try to find the total score
  const totalMatch = text.match(/종합.*?(?:점수|궁합)[^\d]*(\d{1,3})/);
  if (!totalMatch) return null;

  const total = parseInt(totalMatch[1], 10);

  // Try to find dimension scores
  const dimensionPatterns = [
    { pattern: /감정\s*교감[^\d]*(\d{1,3})/, label: "감정교감" },
    { pattern: /성격\s*호환[^\d]*(\d{1,3})/, label: "성격호환" },
    { pattern: /가치관\s*일치[^\d]*(\d{1,3})/, label: "가치관일치" },
    { pattern: /성적\s*궁합[^\d]*(\d{1,3})/, label: "성적궁합" },
    { pattern: /장기\s*안정[^\d]*(\d{1,3})/, label: "장기안정성" },
  ];

  const dimensions = dimensionPatterns
    .map(({ pattern, label }) => {
      const match = text.match(pattern);
      return { label, value: match ? parseInt(match[1], 10) : 0 };
    })
    .filter((d) => d.value > 0);

  // Need at least the total score to show anything
  if (dimensions.length === 0) return null;

  return { total, dimensions };
}
