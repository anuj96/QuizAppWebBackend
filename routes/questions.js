var express = require("express");
var questionsRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;

const uri = `mongodb://localhost:27017/`;
const dbName = "jindarshan";
const fullName = uri + dbName;
const url1 =
  "mongodb://dbuser:password%40123@cluster0-shard-00-00-qqpkg.mongodb.net:27017,cluster0-shard-00-01-qqpkg.mongodb.net:27017,cluster0-shard-00-02-qqpkg.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

questionsRouter.route("/").get(function(req, res) {
  const url2 = url1 + dbName;
  //const client = new MongoClient(uri, { useNewUrlParser: true });
  mongodb.connect(url1, function(err, db) {
    if (err) {
      console.log(err);
      return;
    }
    var collection = db.collection("questions");
    var query = req.query;
    if (query) {
      collection.find(query).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.json(resp);
        db.close();
      });
    } else {
      collection.find({}).toArray(function(err, results) {
        console.log(results);
        let resp = results;
        res.json(resp);
        db.close();
      });
    }
  });
});

questionsRouter
  .route("/")
  .get(function(req, res) {
    //const client = new MongoClient(uri, { useNewUrlParser: true });
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection("questions");
      var query = req.query;
      if (query) {
        collection.find(query).toArray(function(err, results) {
          console.log(results);
          let resp = results;
          res.json(resp);
          db.close();
        });
      } else {
        collection.find({}).toArray(function(err, results) {
          console.log(results);
          let resp = results;
          res.json(resp);
          db.close();
        });
      }
    });
  })
  .post(function(req, res) {
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var questions = req.body;
      questions.questions.map(question => {
        let id = uuidv5(question.question, uuidv5.DNS);
        Object.assign(question, { _id: id });
      });
      console.log(questions);
      var collection = db.collection("questions");
      collection.insert(questions, function(err, results) {
        console.log(results.insertedIds);
        // res.send(results.insertedIds);
        res.send("update is successful " + results.insertedIds);
        db.close();
      });
    });
  });

questionsRouter
  .route("/:id")
  .get(function(req, res) {
    var Id = new objectId(req.params.id);
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection("questions");
      collection.findOne({ _id: Id }, function(err, results) {
        res.json(results);
        db.close();
      });
    });
  })
  //put method to edit
  .put(function(req, res) {
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection("questions");
      var fort = req.body;

      collection.update({ _id: Id }, { $set: fort }, function(err, result) {
        if (err) {
          throw err;
        }
        res.send("updated");
        db.close();
      });
    });
  })
  //delete method
  .delete(function(req, res) {
    var Id = new objectId(req.params.id);
    mongodb.connect(fullName, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection("questions");

      collection.deleteOne({ _id: Id }, function(err, results) {
        res.send("removed");
        db.close();
      });
    });
  });

module.exports = questionsRouter;