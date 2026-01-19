export async function requestMidiDevices(): Promise<MIDIInput[]> {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    return Array.from(midiAccess.inputs.values());
  } catch (error) {
    console.error("Failed to get MIDI access:", error);
  }

  return [];
}

export function listMidiInputsAndOutputs(midiAccess: MIDIAccess) {
  for (const entry of midiAccess.inputs) {
    const input = entry[1];
    console.log(
      `Input port [type:'${input.type}']` +
        ` id:'${input.id}'` +
        ` manufacturer:'${input.manufacturer}'` +
        ` name:'${input.name}'` +
        ` version:'${input.version}'`
    );
  }

  for (const entry of midiAccess.outputs) {
    const output = entry[1];
    console.log(
      `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`
    );
  }
}

function logMidiMessage(event: MIDIMessageEvent) {
  let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data!!.length} bytes]: `;
  for (const character of event.data!){
    str += `0x${character.toString(16)} `;
  }
  console.log(event.data, str);
}

export function startLoggingMIDIInput(input: MIDIInput) {
  input.onmidimessage = logMidiMessage;
}
