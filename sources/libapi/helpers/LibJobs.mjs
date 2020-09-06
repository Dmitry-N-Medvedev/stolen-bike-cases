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

  addJob({ bike = {}, officer = {} }) {
    const job = {
      id: nanoid(5),
      bike,
      officer,
    };

    const isValid = validateJob(job);

    if (isValid === false) {
      this.emit('error:validation', {
        job,
        errors: validateJob.errors,
      });

      return null;
    }

    this.#jobs.set(job.id, job);
    this.emit('job:added', job.id);

    return job.id;
  }

  removeJob(id) {
    if (this.#jobs.delete(id) === true) {
      this.emit('job:removed', id);
    }
  }

  getJob(id) {
    return this.#jobs.get(id);
  }

  get Jobs() {
    return this.#jobs;
  }
}
