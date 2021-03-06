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
  })
  .then(function(results) {
    if (!results.rowCount) {
      // Create them dbs
      return client.queryAsync('CREATE DATABASE nbe');
    }
  })
  .then(function(result) {
    closeDb();
    if (result) {
      return methods.getDb(function(client) {
        return bluebird.all([
          client.queryAsync('CREATE TABLE articles (' +
            ' id SERIAL PRIMARY KEY,' +
            ' title TEXT,' +
            ' content TEXT,' +
            ' published DATE DEFAULT now()' +
          ')'),
          client.queryAsync('CREATE TABLE users (' +
            ' id SERIAL PRIMARY KEY,' +
            ' username VARCHAR(150) NOT NULL,' +
            ' passwordHash VARCHAR(60) NOT NULL' +
          ')')
        ]);
      });
    }
  })
  .finally(function() {
    if (closeDb) {
      closeDb();
    }
  });
};

methods.destroy = function () {
  var client, closeDb;
  return pg.connectAsync(connString + 'postgres').spread(function(dbClient, close) {
    client = dbClient;
    closeDb = close;
    return client.queryAsync('DROP DATABASE nbe');
  })
  .finally(closeDb);
};

methods.getDb = function (fn) {
  var closeDb;
  return pg.connectAsync(connString + 'nbe').bind({}).spread(function(client, close){
    closeDb = close;
    return fn(client);
  })
  .finally(function() {
    closeDb();
  });
};

module.exports = function (connectionString) {
  if (!connectionString) {
    throw new Error('Connection string is required');
  }
  connString = connectionString;
  return methods;
};