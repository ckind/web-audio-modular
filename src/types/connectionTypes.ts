export type ConnectionType = "signal" | "message-bus";

export type MessageBusNumber = number;
export type MessageBusString = string;
export type MessageBusList =
  | Array<MessageBusNumber | MessageBusString | MessageBusList>
  | Uint8Array<ArrayBufferLike>;

export type MessageBusDataType =
  | MessageBusString
  | MessageBusNumber
  | MessageBusList;
