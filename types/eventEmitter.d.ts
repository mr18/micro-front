export type EventCallback = CallableFunction;

export interface EventEmitterInterface {
  eventList: Map<string, Map<string, Set<EventCallback>>>;
  on(name: string, cb: EventCallback): void;
  emit(name: string, data: object): void;
  off(name: string, cb: EventCallback): void;
}
