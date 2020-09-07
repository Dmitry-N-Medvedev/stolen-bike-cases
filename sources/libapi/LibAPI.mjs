import {
  LibOfficers,
} from './helpers/LibOfficers.mjs';
import {
  LibBikes,
} from './helpers/LibBikes.mjs';
import {
  LibJobs,
} from './helpers/LibJobs.mjs';

export class LibAPI {
  #libOfficers = null;
  #libBikes = null;
  #libJobs = null;
  #inactiveJobs = [];

  constructor() {
    this.#libOfficers = new LibOfficers();
    this.#libBikes = new LibBikes();
    this.#libJobs = new LibJobs();
  }

  resolveAvailableOfficerId() {
    return this.#libOfficers.officerIds.find(
      (officerId) => (this.#libJobs.ids.includes(officerId) === false),
    ) ?? null;
  }

  handleBikeAdded(bikeId) {
    const job = {
      bike: {
        id: bikeId,
      },
      officer: {
        id: this.resolveAvailableOfficerId(),
      },
    };

    if (job.officer.id !== null) {
      this.#libJobs.addJob(job);
    } else {
      this.#inactiveJobs.push(job);
    }
  }

  handleBikeRemoved(bikeId) {
    if (this.#libJobs.bikeIds.includes(bikeId)) {
      const job = this.#libJobs.getJobByBikeId(bikeId);

      if (job !== null) {
        this.#libJobs.removeJob(job.id);

        return;
      }
    }

    const inactiveJobIndex = this.#inactiveJobs.findIndex(
      (inactiveJob) => (inactiveJob === null ? false : inactiveJob.bike.id === bikeId),
    ) ?? null;

    if (inactiveJobIndex !== null) {
      this.#inactiveJobs[inactiveJobIndex] = null;
    }
  }

  handleOfficerAdded(officerId) {
    const nextInactiveJob = this.#inactiveJobs.shift() ?? null;

    if (nextInactiveJob !== null) {
      nextInactiveJob.officer.id = officerId;

      this.#libJobs.addJob(nextInactiveJob);
    }
  }

  start() {
    this.#libBikes.on('bike:added', this.handleBikeAdded);
    this.#libBikes.on('bike:removed', this.handleBikeRemoved);

    this.#libOfficers.on('officer:added', this.handleOfficerAdded);
  }

  stop() {
    this.#libOfficers.off('officer:added', this.handleOfficerAdded);

    this.#libBikes.off('bike:removed', this.handleBikeRemoved);
    this.#libBikes.off('bike:added', this.handleBikeAdded);
  }

  get API() {
    return {
      Officers: this.#libOfficers,
      Bikes: this.#libBikes,
      Jobs: this.#libJobs,
    };
  }
}
