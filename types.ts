export interface PianoInstance {
  id: string;
  name: string;        // Display name like "钢琴1"
  x: number;
  y: number;
  zIndex: number;
  startOctave: number; // e.g., 3
  endOctave: number;   // e.g., 5
  scale: number;       // Individual key width in pixels
}

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface NoteConfig {
  name: NoteName;
  hasSharp: boolean; // Does this note have a sharp/flat neighbor to the right?
}

export const NOTES: NoteConfig[] = [
  { name: 'C', hasSharp: true },
  { name: 'D', hasSharp: true },
  { name: 'E', hasSharp: false },
  { name: 'F', hasSharp: true },
  { name: 'G', hasSharp: true },
  { name: 'A', hasSharp: true },
  { name: 'B', hasSharp: false },
];