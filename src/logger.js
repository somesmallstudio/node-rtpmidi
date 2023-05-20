const dummerLogger = {
  level: 0,
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  verbose: () => {},
  debug: () => {},
};

let logger = { ...dummerLogger };

// eslint-disable-next-line no-unused-vars
const createLogger = (l) => {
  // eslint-disable-next-line no-param-reassign
  l.createLoggerRTPMIDILogger = createLogger;
  logger = l;
};

module.exports = logger;
