// Retro Sound Manager for haptic feedback

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize on first user interaction
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.init(), { once: true });
    }
  }

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private createOscillator(frequency: number, duration: number, type: OscillatorType = 'square') {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Envelope for more natural sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Retro keyboard click sound
  playKeyPress() {
    if (!this.audioContext || !this.enabled) return;

    const frequencies = [800, 850, 820, 830, 810]; // Slight variation
    const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    this.createOscillator(frequency, 0.05, 'square');
  }

  // Enter key sound (slightly different)
  playEnterKey() {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'square';
    
    const now = this.audioContext.currentTime;
    
    // Two-tone beep
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.setValueAtTime(400, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // Button click sound
  playButtonClick() {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'square';
    
    const now = this.audioContext.currentTime;
    
    // Quick blip
    oscillator.frequency.setValueAtTime(1200, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.03);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    oscillator.start(now);
    oscillator.stop(now + 0.03);
  }

  // Hover sound
  playHover() {
    if (!this.audioContext || !this.enabled) return;
    
    this.createOscillator(1000, 0.02, 'sine');
  }

  // Error sound
  playError() {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sawtooth';
    
    const now = this.audioContext.currentTime;
    
    // Descending error tone
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new SoundManager();
