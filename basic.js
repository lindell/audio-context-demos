class BasicToneProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
  }

  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 440, minValue: 20, maxValue: 2000 },
      { name: 'gain', defaultValue: 0.2, minValue: 0, maxValue: 1 }
    ];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const frequency = parameters.frequency[0];
    const gain = parameters.gain[0];

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; i++) {
        // Generate basic sine wave sample
        outputChannel[i] = Math.sin(this.phase) * gain;

        // Advance phase on the first channel
        if (channel === 0) {
          this.phase += (2 * Math.PI * frequency) / sampleRate;
          if (this.phase > 2 * Math.PI) {
            this.phase -= 2 * Math.PI;
          }
        }
      }
    }
    return true; // Keep processor alive
  }
}

registerProcessor('basic-tone-processor', BasicToneProcessor);
