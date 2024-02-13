'use strict';

const logger = require('../logger');

var  mdns = null,
EventEmitter = require('events').EventEmitter,
service_id = '_apple-midi',
publishedSessions = [],
advertisments = [],
remoteSessions = {},
browser = null,
avahi_pub;


const {Bonjour} = require('bonjour-service');

const bonjourService = new Bonjour({
  ttl: 20
})

function sessionDetails(session) {
  var addressV4 = null,
  addressV6 = null;

  if (session.addresses) {
    session.addresses.forEach(function(address) {

      if (address.search(/\./) > -1 && !addressV4) {
        addressV4 = address;
      } else if (address.search(':') > -1 && !addressV6) {
        addressV6 = address;
      }
    });
  }

  return {
    name: session.name,
    port: session.port,
    address: addressV4,
    addressV6: addressV6,
    host: session.host
  };
}
var details = {};

var sessions = [];

function updateRemoteSessions() {
  sessions.length = 0;
  for (var name in details) {
    if (details.hasOwnProperty(name)) {
      sessions.push(details[name]);
    }
  }
};

class MDnsService extends EventEmitter {
    constructor() {
        super()
        browser = bonjourService.find({ type: 'apple-midi', protocol: 'udp' });
        browser.on('up', function (service) {
          remoteSessions[service.name] = service;
          details[service.name] = sessionDetails(service);
          updateRemoteSessions();
          this.emit('remoteSessionUp', details[service.name]);
        }.bind(this));
        browser.on('down', function (service) {
          var d = details[service.name];
          delete(remoteSessions[service.name]);
          delete(details[service.name]);
          updateRemoteSessions();
          this.emit('remoteSessionDown', d);
        }.bind(this));
    }

    start() {
      remoteSessions = {};
      if (browser) {
        browser.start();
      } else {
        logger.log('mDNS discovery is not available.')
      }
    }

    stop() {
      if (browser) {
        browser.stop();
      }
    }

    publish(session) {
      if (publishedSessions.indexOf(session) !== -1) {
        return;
      }
      publishedSessions.push(session);
      const ad = bonjourService.publish({ name: session.bonjourName, type: 'apple-midi', port: session.port, protocol: 'udp' })
      logger.debug('Added mDNS service', ad)
      advertisments.push(ad);
      ad.start();
    }

    unpublishAll(cb = () => {}) {
      bonjourService.unpublishAll(cb)
    }

    unpublish(session) {
      var index = publishedSessions.indexOf(session);
      if (index === -1) {
        return;
      }
      var ad = advertisments[index];

      ad.stop(() => {
        publishedSessions.splice(index);
        advertisments.splice(index);
      });
    }

    getRemoteSessions() {
      return sessions;
    }
}

process.on('SIGINT', () => {
  bonjourService.unpublishAll(() => {
    bonjourService.destroy()
    process.exit()
  })
});

module.exports = new MDnsService();
