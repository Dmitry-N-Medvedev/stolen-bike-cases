export class OfficerIdUndefinedError extends Error {
  constructor(...args) {
    super(...args);

    Error.captureStackTrace(this, OfficerIdUndefinedError);
  }
}
