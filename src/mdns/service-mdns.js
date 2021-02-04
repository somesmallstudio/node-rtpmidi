'use strict';

const logger = require('../logger');

var  mdns = null,
util = require('util'),
EventEmitter = require('events').EventEmitter,
service_id = '_apple-midi',//._udp
publishedSessions = [],
advertisments = [],
remoteSessions = {},
browser = null,
avahi_pub;


const dnssd = require('dnssd');

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

function MDnsService() {

    browser = new dnssd.Browser(dnssd.udp(service_id));
    browser.on('serviceUp', function (service) {
      remoteSessions[service.name] = service;
      details[service.name] = sessionDetails(service);
      updateRemoteSessions();
      this.emit('remoteSessionUp', details[service.name]);
    }.bind(this));
    browser.on('serviceDown', function (service) {
      var d = details[service.name];
      delete(remoteSessions[service.name]);
      delete(details[service.name]);
      updateRemoteSessions();
      this.emit('remoteSessionDown', d);


    }.bind(this));


}

util.inherits(MDnsService, EventEmitter);

MDnsService.prototype.start = function () {
  remoteSessions = {};
  if (browser) {
    browser.start();
  } else {
    logger.log('mDNS discovery is not available.')
  }
};

MDnsService.prototype.stop = function() {
  if (browser) {
    browser.stop();
  }
};

MDnsService.prototype.publish = function(session) {
  if (publishedSessions.indexOf(session) !== -1) {
    return;
  }
  publishedSessions.push(session);
  const ad = new dnssd.Advertisement(dnssd.udp(service_id), session.port,{
        name: session.bonjourName
      });
  advertisments.push(ad);
  ad.start();
};

MDnsService.prototype.unpublish = function(session) {
  var index = publishedSessions.indexOf(session);
  if (index === -1) {
    return;
  }
  var ad = advertisments[index];

  ad.stop();


  // if (avahi_pub && avahi_pub.isSupported()) {
  //   ad.remove();
  // } else if (mdns) {
  //   ad.stop();
  // }

  publishedSessions.splice(index);
  advertisments.splice(index);
};

var sessions = [];

function updateRemoteSessions() {
  sessions.length = 0;
  for (var name in details) {
    if (details.hasOwnProperty(name)) {
      sessions.push(details[name]);
    }
  }
};

MDnsService.prototype.getRemoteSessions = function() {
  return sessions;
};

module.exports = new MDnsService();
