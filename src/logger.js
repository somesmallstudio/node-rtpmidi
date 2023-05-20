let dummyLogger = {
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  verbose: () => {},
  debug: () => {},
}

let _logger = dummyLogger

const logger = {
  level: 0,
  log: (...args) => _logger.log(...args),
  info: (...args) => _logger.info(...args),
  warn: (...args) => _logger.warn(...args),
  error: (...args) => _logger.error(...args),
  verbose: (...args) => _logger.debug(...args),
  debug: (...args) => _logger.debug(...args),
  setLogger: logger => _logger = logger,
  dummyLogger,
};

module.exports = logger;
