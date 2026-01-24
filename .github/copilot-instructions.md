# Copilot Instructions

## High Level Architecure Summary

### data models for patches

- the state of a patch is represented by two different models, the PatchGraph which is a serializable model representing the state of the UI instances, and the Patcher class which maintains internal audio resources
- each model maintains its own representation of the graph and should be completely decoupled from the other
- consistency in the state of the overall patch is maintained via dedicated methods
- the module options object represents the state of an audio module (these are strongly typed and defined for each AudioModule class)
- the `updateOptions` method on the AudioModule class syncs options updates from the UI model to the internal audio module
- the `updateUIState` callback method syncs options and other relevant GUI data updated from the internal audio module to the UI model
- `updateUIState(options, guiState)` merges options into the UI instance options and GUI-only state into guiState
- a key priority is making sure these two models are completely decoupled, yet are still in a consistent state with one another

### ui module data-flow patterns

- module options data flow is one-way: module component → module UI instance (view model) → internal audio module class
- UI state data flow is one-way: internal module class → module UI instance (view model) → module component
- the module UI component resolves state changes by listening to UI instance `options` props for internal updates and emitting a (partial) options object via the `options-updated` event to signal user changes

### naming and event conventions

- prefer `options-updated` for module option changes
- avoid mutating props directly in components
- use `updateUIState` for internal module → UI updates

### UI ↔ audio sync rules

- UI components emit partial options; PatchWindow merges and forwards to `updateOptions`
- audio modules may change internal state outside `updateOptions`; use `updateUIState` to communicate those changes back to the UI instance


### resource file management

- Resource files (audio samples, etc.) are represented in the UI/patch model by a lightweight `ResourceFile` marker (name + isResourceFile flag). The binary data and Blob URLs are managed separately by `ResourceFileManager`.
- Responsibilities:
	- Persistence (`usePatchPersistence`) — when loading a patch: unzip and `registerResource(name, blob)` for each resource bundle entry. When saving a patch, request the Blob URL for each registered name to extract the blob into the archive. Persistence should NOT `request` or `release` resources for normal runtime consumption — it only registers on load and relies on consumers to `request`/`release`.
	- UI components — are consumers when they need to read/preview a resource (waveform, metadata). UI components should `registerResource` when the user uploads a new file, and `releaseResource` in their `onUnmounted` or when they replace the uploaded file. For temporary reads (waveform generation), `requestResource` → use → `releaseResource`.
	- Audio modules — are consumers when they need the Blob URL to load into an audio node. Audio modules should `requestResource` in `updateOptions` and `releaseResource` in `dispose` (or when replacing the resource). They own their own lifetime for playback.

- Rules and invariants:
	- Registration: `registerResource(name, blob)` is called once on load or by the UI when the user uploads. It creates the Blob URL and sets refCount=1 (or increments). Consumers should not re-register already-registered names.
	- Request/Release: A consumer that needs a URL must call `requestResource(name)` and later `releaseResource(name)`. `requestResource` increments refCount; `releaseResource` decrements and will revoke the URL when count reaches zero.
	- Ownership: The code path that calls `registerResource` should be responsible for releasing that registration (e.g. UI uploads). For load-time registrations, the preferred flow is:
		1. Persistence (`usePatchPersistence`) registers resource blobs during unzip and reconstructs the patch.
		2. During reconstruction each audio module or UI component that needs a resource should `requestResource(name)` to explicitly take ownership for runtime use (for example, audio modules typically do this in `updateOptions`).
		3. After reconstruction hands over ownership to consumers, persistence should `releaseResource(name)` for the registrations it created to avoid holding long‑lived references and leaking memory when a resource is removed from the patch.
		This pattern avoids races, ensures ownership is explicit, and prevents persistence from being a long‑term owner of resources.
	- Avoid double releases: Consumers must not assume `releaseResource` will be called elsewhere; coordinate ownership clearly (e.g., UI cleans up UI registrations; audio modules clean up audio registrations).
  - Resource file consumption should strictly follow the RAII pattern.


## contribution note

- if you stage commits that conflict with these patterns or make this document inaccurate, Copilot should call it out to the developer so they can reconcile the mismatch
