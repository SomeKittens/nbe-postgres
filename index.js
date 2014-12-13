'use strict';

var bluebird = require('bluebird');

var db;

// TODO: not have a singleton db
exports.init = function(connString) {
  db = require('./db')(connString);
  // Initalize db
  return db.init();
};

// Holy CRUD!
exports.getArticle = function(id) {
  return db.getDb(function(client) {
    return client.queryAsync('SELECT id, title, content FROM articles WHERE id = $1', [id]);
  }).get('rows').get(0);
};

exports.getAllArticles = function () {
  return db.getDb(function (client) {
    return client.queryAsync('SELECT id, title, content FROM articles');
  }).get('rows');
};

exports.saveArticle = function(article) {
  return db.getDb(function (client) {
    return client.queryAsync('UPDATE articles' +
      ' SET title = $1, content = $2' +
      ' WHERE id = $3',
      [article.title, article.content, article.id]);
  });
};

exports.deleteArticle = function(id) {
  return db.getDb(function (client) {
    return client.queryAsync('DELETE FROM articles WHERE id = $1', [id]);
  });
};

exports.createArticle = function() {
  return db.getDb(function (client) {
    return client.queryAsync('INSERT INTO articles DEFAULT VALUES RETURNING id');
  }).get('rows').get(0).get('id');
};

exports.getFrontpage = function() {
  return db.getDb(function (client) {
    return client.queryAsync('SELECT id, title, content FROM articles ORDER BY published DESC LIMIT 10');
  }).get('rows');
};

// User auth stuff
exports.getUserById = function (id) {
  return db.getDb(function (client) {
    return client.queryAsync('SELECT id, username, passwordHash FROM users WHERE id = $1', [id]);
  }).get('rows').get(0);
};

// User auth stuff
exports.getUserByName = function (username) {
  return db.getDb(function (client) {
    return client.queryAsync('SELECT id, username, passwordHash FROM users WHERE username = $1', [username]);
  }).get('rows').get(0);
};

exports.createLocalUser = function(username, password) {
  return db.getDb(function (client) {
    return client.queryAsync('INSERT INTO users (username, passwordHash) VALUES ($1, $2) RETURNING id', [username, password]);
  }).get('rows').get(0).get('id');
};