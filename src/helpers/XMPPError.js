class XMPPError extends Error {
    constructor(message, code) {
      super(message);
      this.name = "XMPPError";
      this.code = code;
    }
  }

export default XMPPError
