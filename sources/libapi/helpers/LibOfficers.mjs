import EventEmitter from 'events';
import Ajv from 'ajv';
import OfficerSchema from '../validator_schema/officer.schema.mjs';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  unknownFormats: false,
});

const validateOfficer = ajv.compile(OfficerSchema);

export class LibOfficers extends EventEmitter {
  #officers = new Map();
  #ids = [];

  addOfficer(officer) {
    const isOfficerValid = validateOfficer(officer);

    if (isOfficerValid === false) {
      this.emit('error:validation', {
        officer,
        errors: validateOfficer.errors,
      });

      return;
    }

    if (this.#officers.has(officer.id) === false) {
      this.#officers.set(officer.id, officer);
      this.#ids.push(officer.id);

      this.emit('officer:added', officer.id);
    }
  }

  removeOfficer(id) {
    if (this.#officers.delete(id) === true) {
      this.#ids.delete(id);
      this.emit('officer:removed', id);
    }
  }

  get ids() {
    return this.#ids;
  }

  get OfficersNumber() {
    return this.#officers.size;
  }
}
