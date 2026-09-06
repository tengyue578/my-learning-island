export type VoiceActivityReason = "unsupported" | "denied" | "silent" | "error";

export interface VoiceActivityResult {
  hasVoice: boolean;
  duration: number;
  reason?: VoiceActivityReason;
}

export class MicrophoneService {
  private stream?: MediaStream;
  private context?: AudioContext;

  isSupported() {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== "undefined";
  }

  async listenForVoice(maxDurationMs = 2200): Promise<VoiceActivityResult> {
    if (!this.isSupported()) return { hasVoice: false, duration: 0, reason: "unsupported" };
    const startedAt = Date.now();
    try {
      this.stop();
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.context = new AudioContext();
      const source = this.context.createMediaStreamSource(this.stream);
      const analyser = this.context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let activeFrames = 0;

      return await new Promise<VoiceActivityResult>((resolve) => {
        const inspect = () => {
          analyser.getByteTimeDomainData(samples);
          let energy = 0;
          for (const sample of samples) {
            const centered = (sample - 128) / 128;
            energy += centered * centered;
          }
          if (Math.sqrt(energy / samples.length) > 0.035) activeFrames += 1;
          const duration = Date.now() - startedAt;
          if (activeFrames >= 4 || duration >= maxDurationMs) {
            this.stop();
            resolve({ hasVoice: activeFrames >= 4, duration, reason: activeFrames >= 4 ? undefined : "silent" });
            return;
          }
          window.setTimeout(inspect, 80);
        };
        inspect();
      });
    } catch (error) {
      this.stop();
      const reason = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError") ? "denied" : "error";
      return { hasVoice: false, duration: Date.now() - startedAt, reason };
    }
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = undefined;
  }
}

export const microphoneService = new MicrophoneService();
