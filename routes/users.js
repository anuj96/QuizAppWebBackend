var express = require("express");
var userRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, usersCollections, databaseName } = require("../config");

/* GET users listing. */
const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;

const connectionString = mongoDbUrl + databaseName;

userRouter
  .route("/")
  .get(function(req, res, next) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(usersCollections);
      var query = req.query;
      if(
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.userId != undefined
      ){
        collection.find( {"userId": query.userId}).count( {}, function(err, results) {
          console.log(results);
          let resp = results;
          res.json(resp);
          db.close();

      });
    }else if ( !(Object.keys(query).length === 0 && query.constructor === Object) && query) {
        collection.find(query).toArray(function(err, results) {
          let resp = results;
          res.json(resp);
          db.close();
        });
      } else {
        collection.find({}).toArray(function(err, results) {
          let resp = results;
          res.json(resp);
          db.close();
        });
      }
    });
  })
  .post(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var user = req.body;
      var collection = db.collection(usersCollections);
      let id = uuidv5(user.fullname + user.mobile, uuidv5.DNS);
      Object.assign(user, { userId: id });
      collection.insert(user, function(err, results) {
        console.log(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

module.exports = userRouter;
