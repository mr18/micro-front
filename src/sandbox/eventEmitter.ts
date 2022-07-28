import { EventEmitterInterface, callback } from 'typings/eventEmitter';
export class EventEmitter implements EventEmitterInterface {
  eventList = new Map();
  constructor(data) {}
  on(name: string, callback: callback) {}
}
