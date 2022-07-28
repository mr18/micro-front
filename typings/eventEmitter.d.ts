export type callback = () => void;

export interface EventEmitterInterface {
  eventList: Map<string, Map<callback, Set<callback>>>;
  on(name: string, cb: callback): void;
  emit(name: string, data: Parameters): void;
  off(name: string, cb: callback): void;
}
