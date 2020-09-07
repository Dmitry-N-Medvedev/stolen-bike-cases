import EventEmitter from 'events';
import {
  nanoid,
} from 'nanoid';
import Ajv from 'ajv';
import JobSchema from '../validator_schema/job.schema.mjs';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  unknownFormats: false,
});

const validateJob = ajv.compile(JobSchema);

export class LibJobs extends EventEmitter {
  #jobs = new Map();
  #officerIds = [];
  #bikeIds = [];

  addJob({ bike = {}, officer = {} }) {
    const job = Object.freeze({
      id: nanoid(5),
      bike,
      officer,
    });

    const isValid = validateJob(job);

    if (isValid === false) {
      this.emit('error:validation', {
        job,
        errors: validateJob.errors,
      });

      return undefined;
    }

    // TODO: make a test for each of the next two ifs
    if (this.#officerIds.includes(officer.id)) {
      this.emit('job:rejected', {
        reason: 'alreadyInUse',
        type: 'officer',
        id: officer.id,
      });

      return undefined;
    }

    if (this.#bikeIds.includes(bike.id)) {
      this.emit('job:rejected', {
        reason: 'alreadyInUse',
        type: 'bike',
        id: bike.id,
      });

      return undefined;
    }

    this.#jobs.set(job.id, job);
    this.#officerIds.push(officer.id);
    this.#bikeIds.push(bike.id);

    this.emit('job:added', job.id);

    return undefined;
  }

  removeJob(id) {
    if (this.#jobs.has(id)) {
      const { bike, officer } = this.#jobs.get(id);

      this.#officerIds.delete(officer.id);
      this.#bikeIds.delete(bike.id);

      if (this.#jobs.delete(id) === true) {
        this.emit('job:removed', id);
      }
    }
  }

  getJobByBikeId(bikeId) {
    if (this.#bikeIds.includes(bikeId) === false) {
      return null;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const job of this.#jobs.values()) {
      if (job.bike.id === bikeId) {
        return job.id;
      }
    }

    return null;
  }

  completeJob(id) {
    if (this.#jobs.has(id)) {
      const {
        bike,
        officer,
      } = this.#jobs.get(id);

      this.#officerIds.delete(officer.id);
      this.#bikeIds.delete(bike.id);

      if (this.#jobs.delete(id) === true) {
        this.emit('job:completed', {
          id,
          bikeId: bike.id,
          officerId: officer.id,
        });
      }
    }
  }

  get bikeIds() {
    return this.#bikeIds;
  }

  get officerIds() {
    return this.#officerIds;
  }

  getJob(id) {
    return this.#jobs.get(id);
  }

  get Jobs() {
    return this.#jobs;
  }
}
