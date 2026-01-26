import {
  type MessageBusDataType,
  type MessageBusList,
} from "@/types/connectionTypes";

export function isAnyArray(value: any): boolean {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

export function mergeMessageElements(
  element1: MessageBusDataType,
  element2: MessageBusDataType,
): MessageBusList {
  // todo: how to handle UInt8Array?
  if (Array.isArray(element1)) {
    const list1 = element1 as Array<MessageBusDataType>;
    if (Array.isArray(element2)) {
      const list2 = element2 as Array<MessageBusDataType>;
      return list1.concat(list2);
    } else {
      return [...list1, element2];
    }
  } else if (Array.isArray(element2)) {
    const list2 = element2 as Array<MessageBusDataType>;
    return [ element1, ...list2 ];
  } else {
    return [element1, element2];
  }
}
