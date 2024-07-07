/**
 * Represents an HTTP error.
 * @extends Error
 */
export class HttpErrors extends Error {
  /**
   * Creates a new instance of the HttpErrors class.
   * @param {string} message - The error message.
   * @param {number} errorCode - The error code.
   */
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;
  }
}
