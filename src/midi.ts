export async function requestMidiDevices(): Promise<MIDIInput[]> {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    return Array.from(midiAccess.inputs.values());
  } catch (error) {
    console.error("Failed to get MIDI access:", error);
  }

  return [];
}
