'use strict';

var bluebird = require('bluebird');

var db;

exports.init = function(connString) {
  db = require('./db')(connString);
  // Initalize db
  return db.init();
};

// Holy CRUD!
exports.getArticle = function(id) {
  return db.getDb().then(function() {
    return this.client.queryAsync('SELECT id, title, content FROM articles WHERE id = $1', [id]);
  }).get('rows').get(0);
};

exports.getAllArticles = function () {
  return db.getDb().then(function() {
    return this.client.queryAsync('SELECT id, title, content FROM articles');
  }).get('rows');
};

exports.saveArticle = function(article) {
  return db.getDb().then(function() {
    return this.client.queryAsync('UPDATE articles' +
      ' SET title = $1, content = $2' +
      ' WHERE id = $3',
      [article.title, article.content, article.id]);
  });
};

exports.deleteArticle = function(id) {
  return db.getDb().then(function() {
    return this.client.queryAsync('DELETE FROM articles WHERE id = $1', [id]);
  });
};

exports.createArticle = function() {
  return db.getDb().then(function() {
    return this.client.queryAsync('INSERT INTO articles DEFAULT VALUES RETURNING id');
  }).get('rows').get(0).get('id');
};

exports.getFrontpage = function() {
  return db.getDb().then(function() {
    return this.client.queryAsync('SELECT id, title, content FROM articles ORDER BY published DESC LIMIT 10');
  }).get('rows');
};