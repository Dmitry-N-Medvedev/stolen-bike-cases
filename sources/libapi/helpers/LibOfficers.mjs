import EventEmitter from 'events';
import {
  OfficerIdUndefinedError,
} from '../errors/LibOfficers.OfficerIdUndefinedError.mjs';

const verifyOfficerId = (id = null) => {
  if (id === null) {
    throw new OfficerIdUndefinedError('Officer ID is undefined');
  }

  if (typeof id !== 'string') {
    throw new TypeError('Officer ID is not a string');
  }
};

export class LibOfficers extends EventEmitter {
  #officers = new Map();

  addOfficer(id) {
    verifyOfficerId(id);

    if (this.#officers.has(id) === false) {
      this.#officers.set(id, {
        id,
      });

      this.emit('officer:added', this.#officers.get(id));
    }
  }

  removeOfficer(id) {
    verifyOfficerId(id);

    if (this.#officers.delete(id) === true) {
      this.emit('officer:removed', {
        id,
      });
    }
  }

  get OfficersNumber() {
    return this.#officers.size;
  }
}
