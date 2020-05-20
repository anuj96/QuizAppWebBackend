var express = require("express");
var examquestionsRouter = express.Router();
var mongodb = require("mongodb").MongoClient;
var objectId = require("mongodb").ObjectID;
var bodyParser = require("body-parser");
var uuidv5 = require("uuid").v5;
var { mongoDbUrl, examquestionsCollection, databaseName } = require("../config");

examquestionsRouter
  .route("/")
  .get(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(examquestionsCollection);
      var query = req.query;
      if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.date != undefined &&
        query.date[1] === "all"
      ) {
        collection.find({}, { date: 1 }).toArray(function(err, results) {
          console.log(results);
          let resp = results;
          res.json(resp);
          db.close();
        });
      } else if (
        !(Object.keys(query).length === 0 && query.constructor === Object) &&
        query.allresult === "true"
      ) {
        db.collection("examusersresponse")
          .aggregate([
            {
              $lookup: {
                from: "examusers",
                let: { userId: "usersAnswer.userId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$userId", "$$userId"]
                      }
                    }
                  },
                  {
                    $project: {
                      // "usersAnswer.answers": 1,
                      // "usersAnswer.comment": 1
                    }
                  }
                ],

                as: "test"
              }
            }
          ])
          .toArray(function(err, results) {
            if (err) throw err;
            res.json(results);
            db.close();
          });
      } else if (
        query &&
        !(Object.keys(query).length === 0 && query.constructor === Object)
      ) {
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
    mongodb.connect(connectionString, function(err, db) {
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
      var collection = db.collection(examquestionsCollection);
      collection.insert(questions, function(err, results) {
        console.log(results.insertedIds);
        const userResponse = {
          date: questions.date,
        usersAnswer:[]
        }
        db.collection("examusersresponse").insert(userResponse,function(err,results){
          console.log(results.insertedIds)
          res.send("update is successful " + results.insertedIds);
          db.close();
        })
      });
    });
  });

questionsRouter
  .route("/:id")
  .get(function(req, res) {
    var Id = new objectId(req.params.id);
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(examquestionsCollection);
      collection.findOne({ _id: Id }, function(err, results) {
        res.json(results);
        db.close();
      });
    });
  })
  //put method to edit
  .put(function(req, res) {
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(examquestionsCollection);
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
    mongodb.connect(connectionString, function(err, db) {
      if (err) {
        console.log(err);
        return;
      }
      var collection = db.collection(examquestionsCollection);

      collection.deleteOne({ _id: Id }, function(err, results) {
        res.send("removed");
        db.close();
      });
    });
  });

module.exports = questionsRouter;
