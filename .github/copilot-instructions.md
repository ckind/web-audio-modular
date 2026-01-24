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


## contribution note

- if you stage commits that conflict with these patterns or make this document inaccurate, Copilot should call it out to the developer so they can reconcile the mismatch
