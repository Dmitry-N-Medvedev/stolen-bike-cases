import {
  nanoid,
} from 'nanoid';
import mocha from 'mocha';
import chai from 'chai';
import {
  LibOfficers,
} from '../helpers/LibOfficers.mjs';

const {
  describe,
  beforeEach,
  afterEach,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('LibOfficers', () => {
  let libOfficers = null;

  beforeEach(() => {
    libOfficers = new LibOfficers();
  });

  afterEach(() => {
    libOfficers = null;
  });

  it('should fail to addOfficer with incorrect parameters', async () => {
    const officerDefinitions = [
      {
        officer: {},
        errors: [
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
      const expectedNumOfErrors = officerDefinitions.reduce(
        (acc, officerDefinition) => acc + officerDefinition.errors.length,
        0,
      );
      let numOfProcessedErrors = 0;
      const processValidationError = (officer, errors) => {
        numOfProcessedErrors += errors.length;
        if (numOfProcessedErrors === expectedNumOfErrors) {
          resolve();
        }
      };

      libOfficers.on('officer:added', () => {
        reject(new Error('officer:added event is unexpected'));
      });

      libOfficers.on('error:validation', ({
        officer,
        errors,
      }) => {
        processValidationError(officer, errors);
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const officerDefinition of officerDefinitions) {
        libOfficers.addOfficer(officerDefinition.officer);
      }
    });

    return run();
  });

  it('should addOfficer/removeOfficer', () => new Promise((resolve) => {
    const officer = {
      id: nanoid(5),
    };

    const doAddOfficer = (newOfficer) => new Promise((addOfficerOK) => {
      libOfficers.once('officer:added', (newOfficerId) => {
        expect(officer.id).to.equal(newOfficerId);

        addOfficerOK(newOfficerId);
      });

      libOfficers.addOfficer(newOfficer);
    });

    const doRemoveOfficer = (id) => new Promise((removeOfficerOK) => {
      libOfficers.once('officer:removed', (removedOfficerId) => {
        expect(officer.id).to.equal(removedOfficerId);

        removeOfficerOK();
      });

      libOfficers.removeOfficer(id);
    });

    doAddOfficer(officer)
      .then(async (newOfficerId) => {
        await doRemoveOfficer(newOfficerId);

        resolve();
      });
  }));
});
