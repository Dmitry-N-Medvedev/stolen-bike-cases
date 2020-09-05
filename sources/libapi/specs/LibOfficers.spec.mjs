import {
  nanoid,
} from 'nanoid';
import mocha from 'mocha';
import chai from 'chai';
import {
  OfficerIdUndefinedError,
} from '../errors/LibOfficers.OfficerIdUndefinedError.mjs';
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

  it('should addOfficer', () => new Promise((resolve) => {
    const officerId = nanoid(5);

    libOfficers.on('officer:added', (officer) => {
      expect(libOfficers.OfficersNumber).to.equal(1);
      expect(officer.id).to.equal(officerId);

      resolve();
    });

    expect(libOfficers.OfficersNumber).to.equal(0);

    libOfficers.addOfficer(officerId);
  }));

  it('should fail to addOfficer when officerId is undefined', async () => {
    const officerId = null;

    try {
      libOfficers.addOfficer(officerId);
    } catch (error) {
      expect(error).to.be.instanceOf(OfficerIdUndefinedError);
    }
  });

  it('should fail to addOfficer when officerId is not a string', async () => {
    const officerId = 0;

    try {
      libOfficers.addOfficer(officerId);
    } catch (error) {
      expect(error).to.be.instanceOf(TypeError);
    }
  });

  it('should removeOfficer', () => new Promise((resolve) => {
    const officerId = nanoid(5);

    const doAddOfficer = (id) => new Promise((addOfficerOK) => {
      libOfficers.on('officer:added', (officer) => {
        expect(officer.id).to.equal(officerId);

        addOfficerOK(officer);
      });

      libOfficers.addOfficer(id);
    });

    const doRemoveOfficer = (id) => new Promise((removeOfficerOK) => {
      libOfficers.on('officer:removed', (officer) => {
        expect(officer.id).to.equal(officerId);

        removeOfficerOK();
      });

      libOfficers.removeOfficer(id);
    });

    doAddOfficer(officerId)
      .then(async (officer) => {
        await doRemoveOfficer(officer.id);

        resolve();
      });
  }));
});
