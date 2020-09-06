import EventEmitter from 'events';
import Ajv from 'ajv';
import BikeSchema from '../validator_schema/bike.schema.mjs';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  unknownFormats: false,
});

const validateBike = ajv.compile(BikeSchema);

export class LibBikes extends EventEmitter {
  #bikes = new Map();

  addBike(bike) {
    const isBikeValid = validateBike(bike);

    if (isBikeValid === false) {
      this.emit('error:validation', {
        bike,
        errors: validateBike.errors,
      });
    }

    if (this.#bikes.has(bike.id) === false) {
      this.#bikes.set(bike.id, {
        id: bike.id,
      });

      this.emit('bike:added', bike.id);
    }
  }

  removeBike(id) {
    if (this.#bikes.delete(id) === true) {
      this.emit('bike:removed', id);
    }
  }
}
