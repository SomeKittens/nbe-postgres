'use strict';

var pg = require('pg')
  , bluebird = require('bluebird');

bluebird.promisifyAll(pg);
bluebird.promisifyAll(pg.Client.prototype);

var methods = {}
  , connString;

methods.init = function () {
  var client, closeDb;
  return pg.connectAsync(connString + 'postgres').spread(function(dbClient, close) {
    client = dbClient;
    closeDb = close;
    return client.queryAsync('SELECT 1 AS result FROM pg_database WHERE datname = \'nbe\'');
  }).then(function(results) {
    if (!results.rowCount) {
      // Create them dbs
      return client.queryAsync('CREATE DATABASE nbe')
      .then(function() {
        return client.queryAsync('CREATE TABLE nbe_articles (' +
          ' id SERIAL PRIMARY KEY,' +
          ' title TEXT,' +
          ' content TEXT' +
          ')');
      });
    }
  }).finally(closeDb);
};

methods.destroy = function () {
  var client, closeDb;
  return pg.connectAsync(connString + 'postgres').spread(function(dbClient, close) {
    client = dbClient;
    closeDb = close;
    return client.queryAsync('DROP TABLE nbe_articles');
  }).then(function() {
    return client.queryAsync('DROP DATABASE nbe');
  }).finally(closeDb);
};

methods.getDb = function () {
  return function () {
    var closeDb;
    return pg.connectAsync(connString + 'nbe').spread(function(client, close){
      closeDb = close;
    }).finally(function(){ closeDb(); });
  };
};

module.exports = function (connectionString) {
  if (!connectionString) {
    throw new Error('Connection string is required');
  }
  connString = connectionString;
  return methods;
};