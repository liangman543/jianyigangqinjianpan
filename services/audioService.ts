// Simple synth engine
class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  // Map to store active oscillators: key = "NoteName-Octave" -> value = { osc, gain }
  private activeNotes: Map<string, { osc: OscillatorNode; gain: GainNode }> = new Map();

  constructor() {
    // Lazy initialization handled in init
  }

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Lower master volume slightly to prevent clipping on chords
      this.masterGain.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private getFrequency(noteName: string, octave: number): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = notes.indexOf(noteName);
    const midiNote = (octave + 1) * 12 + noteIndex;
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  public startNote(noteName: string, octave: number) {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    const key = `${noteName}-${octave}`;

    // If already playing, stop it first to restart (prevents stuck notes)
    if (this.activeNotes.has(key)) {
      this.stopNote(noteName, octave);
    }

    const osc = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();

    osc.type = 'triangle'; // Triangle is nice for basic synth piano
    osc.frequency.setValueAtTime(this.getFrequency(noteName, octave), this.audioContext.currentTime);

    // Instant attack, nearly zero latency
    const now = this.audioContext.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(1, now + 0.01); // 10ms attack to prevent click

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start();

    // Store reference so we can stop it later
    this.activeNotes.set(key, { osc, gain: noteGain });
  }

  public stopNote(noteName: string, octave: number) {
    if (!this.audioContext) return;
    
    const key = `${noteName}-${octave}`;
    const activeNote = this.activeNotes.get(key);

    if (activeNote) {
      const { osc, gain } = activeNote;
      const now = this.audioContext.currentTime;
      
      // Very quick release for "no reverb" feel, just enough to avoid a pop
      const releaseTime = now + 0.05;
      
      // Cancel any scheduled changes
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, releaseTime);

      osc.stop(releaseTime);
      
      // Cleanup map immediately so we know it's "off" logically
      this.activeNotes.delete(key);
      
      // Cleanup node references after they stop
      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 100);
    }
  }
}

export const audioService = new AudioService();