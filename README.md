# Web Audio Modular

Web Audio Modular is a Max/MSP-inspired visual patching interface for the Web Audio API.

## Usage

1) Install dependencies:

```bash
npm install
```

2) Start the dev server:

```bash
npm run dev
```

3) Open the app at http://localhost:5173 and build a patch:
- Right-click anywhere on the canvas to open the context menu, then pick a module type
- Drag modules to reposition them
- Click an output jack, then click an input jack to create a connection; click a cable to select it
- Double-click a module to select it; press `Delete`/`Backspace` to remove the selected module or cable
- Press `Esc` to cancel an in-progress connection
- Click **Save Patch** to download the current graph as patch.json

4) Build for production:

```bash
npm run build
```

Type-check only:

```bash
npm run type-check
```

## Connection Types

Connections between a module input and a module output are divided into two main categories, Signals and Message Buses. A Signal represents continuous stream of values such as an audio signal, whereas a Message Bus is used pass messages between nodes at discrete intervals to set parameters or trigger events (like an envelope) at precisely scheduled times. Signal connections are displayed with blue wires and Message Bus connections are display with gray wires.

