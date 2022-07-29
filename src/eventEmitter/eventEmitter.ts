import { EventCallback, EventEmitterInterface } from '../../types/eventEmitter';
import Logger from '../utils/logger';
export class EventEmitter implements EventEmitterInterface {
  eventList = new Map();
  constructor() {
    Logger.log('new');
  }
  on(name: string, callback: EventCallback) {
    Logger.log(name, callback);
  }
  emit(name: string, callback: object) {
    Logger.log(name, callback);
  }
  off(name: string, callback: EventCallback) {
    Logger.log(name, callback);
  }
}
