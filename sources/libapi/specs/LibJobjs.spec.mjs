import {
  nanoid,
} from 'nanoid';
import mocha from 'mocha';
import chai from 'chai';
import {
  LibJobs,
}
  from '../helpers/LibJobs.mjs';

const {
  describe,
  beforeEach,
  afterEach,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('LibJobs', () => {
  let libJobs = null;

  beforeEach(() => {
    libJobs = new LibJobs();
  });

  afterEach(() => {
    libJobs = null;
  });

  it('should addJob/removeJob', async () => {
    const officer = {
      id: nanoid(5),
    };
    const bike = {
      id: nanoid(5),
    };

    libJobs.once('error:validation', () => {
      throw new Error('unexpected error:validation');
    });

    const addJob = ({
      aBike,
      aOfficer,
    }) => new Promise((addJobOK) => {
      libJobs.once('job:added', (newJobId) => {
        expect(libJobs.Jobs.size).to.equal(1);

        const job = libJobs.getJob(newJobId);

        expect(job.id).to.equal(newJobId);
        expect(job.officer.id).to.equal(officer.id);
        expect(job.bike.id).to.equal(bike.id);

        addJobOK(newJobId);
      });

      const job = {
        bike: aBike,
        officer: aOfficer,
      };

      libJobs.addJob(job);
    });
    const removeJob = (id) => new Promise((removeJobOK) => {
      libJobs.once('job:removed', (removedJobId) => {
        expect(removedJobId).to.equal(id);

        removeJobOK(removedJobId);
      });

      libJobs.removeJob(id);
    });

    const newJobId = await addJob({
      aBike: bike,
      aOfficer: officer,
    });

    return removeJob(newJobId);
  });

  it('should fail to addJob with incorrect parameters', async () => {
    const jobDefinitions = [
      {
        job: {},
        errors: [
          {
            keyword: 'required',
            dataPath: '.bike',
            params: {
              missingProperty: 'id',
            },
          },
          {
            keyword: 'required',
            dataPath: '.officer',
            params: {
              missingProperty: 'id',
            },
          },
        ],
      },
    ];

    const run = () => new Promise((resolve, reject) => {
      const expectedNumOfErrors = jobDefinitions.reduce(
        (acc, jobDefinition) => acc + jobDefinition.errors.length,
        0,
      );
      let numOfProcessedErrors = 0;
      const processValidationError = (job, errors) => {
        numOfProcessedErrors += errors.length;
        if (numOfProcessedErrors === expectedNumOfErrors) {
          resolve();
        }
      };

      libJobs.on('job:added', () => {
        reject(new Error('job:added event is unexpected'));
      });

      libJobs.on('error:validation', ({
        job,
        errors,
      }) => {
        processValidationError(job, errors);
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const jobDefinition of jobDefinitions) {
        libJobs.addJob(jobDefinition.job);
      }
    });

    return run();
  });
});
