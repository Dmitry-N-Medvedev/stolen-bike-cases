import {
  nanoid,
} from 'nanoid';
import mocha from 'mocha';
import chai from 'chai';
import {
  LibBikes,
} from '../helpers/LibBikes.mjs';

const {
  describe,
  beforeEach,
  afterEach,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('LibBikes', () => {
  let libBikes = null;

  beforeEach(() => {
    libBikes = new LibBikes();
  });

  afterEach(() => {
    libBikes = null;
  });

  it('should fail to addBike with incorrect parameters', async () => {
    const bikeDefinitions = [
      {
        bike: {},
        errors: [
          {
            keyword: 'required',
            dataPath: '.bike',
            params: {
              missingProperty: 'id',
            },
          },
        ],
      },
    ];

    const run = () => new Promise((resolve, reject) => {
      const expectedNumOfErrors = bikeDefinitions.reduce(
        (acc, bikeDefinition) => acc + bikeDefinition.errors.length,
        0,
      );
      let numOfProcessedErrors = 0;
      const processValidationError = (officer, errors) => {
        numOfProcessedErrors += errors.length;
        if (numOfProcessedErrors === expectedNumOfErrors) {
          resolve();
        }
      };

      libBikes.on('bike:added', () => {
        reject(new Error('bike:added event is unexpected'));
      });

      libBikes.on('error:validation', ({
        bike,
        errors,
      }) => {
        processValidationError(bike, errors);
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const bikeDefinition of bikeDefinitions) {
        libBikes.addBike(bikeDefinition.bike);
      }
    });

    return run();
  });

  it('should addBike/removeBike', () => new Promise((resolve) => {
    const bike = {
      id: nanoid(5),
    };

    const doAddBike = (newBike) => new Promise((addBikeOK) => {
      libBikes.once('bike:added', (newBikeId) => {
        expect(bike.id).to.equal(newBikeId);

        addBikeOK(newBikeId);
      });

      libBikes.addBike(newBike);
    });

    const doRemoveBike = (id) => new Promise((removeBikeOK) => {
      libBikes.once('bike:removed', (removedBikeId) => {
        expect(bike.id).to.equal(removedBikeId);

        removeBikeOK();
      });

      libBikes.removeBike(id);
    });

    doAddBike(bike)
      .then(async (newBikeId) => {
        await doRemoveBike(newBikeId);

        resolve();
      });
  }));
});
