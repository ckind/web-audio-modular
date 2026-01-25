<template>
  <v-container class="overview py-8">
    <section class="section mb-4">
      <div class="text-overline mb-2">Overview</div>
      <h1 class="text-h4 font-weight-bold mb-3">Web Audio Modular</h1>
      <p class="text-body-1 mb-0">
        Web Audio Modular is a graphical interface for creative music and sound
        design heavily inspired by Max/MSP. Create expressive and evolving
        systems by visually patching together modules that process signals and
        exchange messages, much like a virtual modular synth. Web Audio Modular
        utilizes
        <a href="https://tonejs.github.io/" target="_blank">Tone.js</a> and the
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API"
          target="_blank"
          >Web Audio API</a
        >
        for high performance, low latency signal processing all in a modern web
        browser.
      </p>
    </section>

    <section class="section mb-4">
      <h2 class="text-h5 mb-3">Modules and Connections</h2>
      <p class="text-body-1 mb-0">
        The main objects in web audio modular are
        <strong><i>modules</i></strong> and <strong><i>connections</i></strong
        >. Modules are objects which generate data, manipulate data and send or
        receive data via their inputs and outputs. Connections are links from an
        output of one module to an input of another.
      </p>
    </section>

    <section class="section mb-4">
      <h2 class="text-h5 mb-3">Connection Types</h2>
      <p class="text-body-1 mb-0">
        Connections are divided into two types –
        <strong><i>signals</i></strong> and <strong><i>message buses</i></strong
        >. Signal connections are used to transmit continuous streams of data,
        such as audio, while message buses are used to transmit packets of data
        in discrete events scheduled at specific times. For example, the main
        output of an oscillator module is a continuous stream of numbers between
        -1 and 1 representing the position of the waveform over time. The main
        output of a midi-input module is a single midi message that is forwarded
        to any other modules connected via message bus when triggered.
      </p>
    </section>

    <section class="section mb-4">
      <h2 class="text-h5 mb-3">Module Inputs and Outputs</h2>
      <p class="text-body-1 mb-0">
        A module can have 0 or more inputs and outputs. Inputs and outputs are
        also divided into signal and message bus types. A signal output cannot
        be connected to a message bus input and vice versa (each module clearly
        indicates the types of its inputs and outputs). There are a number of
        modules that allow conversion between signals and messages such as
        <strong>msg-to-signal</strong>, which converts the incoming message into
        a continuous stream of values, and <strong>msg-sample</strong>, which
        samples the incoming signal and outputs a single message.
      </p>
    </section>

    <section class="section mb-4">
      <h2 class="text-h5 mb-3">Message Data Types</h2>
      <p class="text-body-1">
        Data transmitted via message bus can be one of the following data types:
        a <strong>Number</strong>, a <strong>String</strong> or a
        <strong>List</strong> of the aforementioned.
      </p>
      <br />
      <v-list density="compact" lines="one">
        <v-list-item>
          <template #title>
            <div class="type-row">
              <span class="font-weight-medium">Number:</span>
              <span class="text-body-2 text-medium-emphasis">
                Any decimal number – implemented by the JavaScript
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number"
                  target="_blank"
                  >number</a
                >
                type.
              </span>
            </div>
          </template>
        </v-list-item>
        <v-list-item>
          <template #title>
            <div class="type-row">
              <span class="font-weight-medium">String:</span>
              <span class="text-body-2 text-medium-emphasis">
                A sequence of Unicode characters, often human readable text –
                implemented by the JavaScript
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String"
                  target="_blank"
                  >string</a
                >
                type.
              </span>
            </div>
          </template>
        </v-list-item>
        <v-list-item>
          <template #title>
            <div class="type-row">
              <span class="font-weight-medium">List:</span>
              <span class="text-body-2 text-medium-emphasis">
                A sequence of values (Numbers, Strings or other Lists) –
                implemented by the JavaScript
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array"
                  target="_blank"
                  >array</a
                >
                type.
              </span>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <br />

      <p class="text-body-2 mb-0">
        Consult the documentation for each module to see what data type(s) a
        given message bus input/output sends or receives.
      </p>
    </section>

    <section class="section mb-4">
      <p>See the example patches to get started!</p>
    </section>

    <v-divider class="my-6"></v-divider>

    <section class="section mb-4">
      <div class="text-overline mb-2">In Depth</div>
      <h2 class="mb-3">Message Buses and Events</h2>
      <p class="text-body-1 mb-0">
        While signal connections can be thought of as streams that flow from one
        module to another, messages are single events that are processed at
        specific times throughout the entire patch. This is implemented through
        event scheduling. "Sending" a message in a WAM patch is scheduling a
        message to be delivered at a specific time. For example, a clock module
        sends a pulse by scheduling it to arrive at any modules it's connected
        to at time <strong><i>t</i></strong
        >. Modules that "listen" to this clock pulse and forward it will
        schedule messages to arrive at their respective listeners also at time
        <strong><i>t</i></strong
        >. Even though the code that schedules the deliveries runs sequentially,
        the messages will be processed throughout the entire graph at the exact
        same time. <br /><br />
        <a href="https://tonejs.github.io/" target="_blank">Tone.js</a> helps
        achieve this by scheduling most events slightly ahead of time using a
        short "lookahead" window. This means events are planned in advance,
        giving the code that schedules them time to complete before the moment
        they are processed, while still being delivered at their intended time.
        <br /><br />
        Messages that require minimal latency — such as MIDI messages, buttons,
        and other controls that react directly to user gestures — bypass this
        lookahead and are scheduled to occur as soon as possible. This reduces
        timing accuracy compared to lookahead-based scheduling, but greatly
        improves the feeling of responsiveness.
        <br /><br />
        Most WAM modules are designed with this tradeoff in mind and include
        measures to work around it, preserving the perception of instantaneous
        message processing throughout the entire patch.
      </p>
    </section>
  </v-container>
</template>

<script setup lang="ts">
// Static informational view; no script logic required.
</script>

<style scoped>
.overview {
  max-width: 1080px;
  margin: 0 auto;
}

.type-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
}
</style>
