/**
 * Generates a mock frequency response graph data.
 */
export function generateFrGraph(peakHz: number, peakDb: number, bassBoost = 0): [number, number][] {
  const points: [number, number][] = [];
  const frequencies = [
    20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150,
    4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000,
  ];

  for (const hz of frequencies) {
    const logHz = Math.log10(hz);
    const logPeak = Math.log10(peakHz);
    const spread = 1.2;
    const deviation = ((logHz - logPeak) / spread) ** 2;
    const base = peakDb - 12 * deviation;
    const bass = hz < 200 ? bassBoost * (1 - hz / 200) : 0;
    const treble = hz > 8000 ? -3 * ((hz - 8000) / 12000) : 0;
    const dB = parseFloat((base + bass + treble).toFixed(1));
    points.push([hz, dB]);
  }

  return points;
}
