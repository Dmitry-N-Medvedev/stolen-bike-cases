import {
  LibOfficers,
} from './helpers/LibOfficers.mjs';

export class LibAPI {
  #libOfficers = null;

  constructor() {
    this.#libOfficers = new LibOfficers();
  }

  get Officers() {
    return this.#libOfficers;
  }
}
