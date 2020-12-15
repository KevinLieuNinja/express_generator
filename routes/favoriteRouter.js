const express = require("express");
const cors = require("./cors");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .then((user) => {
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        res.json(user);
      })
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((campFavorite) => {
            if (!favorite.campsites.includes(campFavorite._id)) {
              favorite.campsites.push(campFavorite._id);
            }
          });
          favorite
            .save()
            .then((fav) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(fav);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body })
            .then((campsite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(campsite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("Couldnt find favorite you want to delete");
        }
      })
      .catch((err) => next(err));
  });

// From the frontend: https://localhost:3443/favorites/349587345987345
favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {})
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // find the favorite document that belongs to the currently logged in user
    Favorite.findOne({ user: req.user._id })
      // after the findOne operation run:
      .then((favorite) => {
        // if it found a document
        if (favorite) {
          // check in the list of campsites that this favorite document has
          // if it has the campsiteId that we are passing through the URL
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            // if it's not there, let's add it:
            favorite.campsites.push(req.params.campsiteId);
          }

          // since we modified the favorite document, we need to save it:
          favorite
            .save() // the save() method of the document returns a promise
            .then((fav) => {
              // we send back a response to the client
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(fav);
            })
            .catch((err) => next(err));

          // if it didn't find a document
        } else {
          // we created a new doc for the user
          Favorite.create({
            user: req.user._id, // assigning the current user the the user field
            campsites: [req.params.campsiteId], // assign the one campsiteId we have inside a new array to the campsites field
          })
            .then((campsite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(campsite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //   this will findONE favorite doc that belongs to the logged in user
    Favorite.findOne({ user: req.user._id })
      .then((favDoc) => {
        //   if doc was found run:
        if (favDoc) {
          //  created a variable ('index') for making the code more readable.
          //  looking for the campsiteId's index of campsites from the favDoc ?
          const index = favDoc.campsites.indexOf(req.params.campsiteId);
          //   using splice to remove 1 from the index of campsites from favDoc
          favDoc.campsites.splice(index, 1);
          favDoc
            //   since we've modified the req.params or the favDoc we need to save it:
            .save()
            // the save() method will return a promise
            .then((favDoc) => {
              // we send back a response to the client
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favDoc);
            })
            .catch((err) => next(err));
          // if it didnt find a favorite document
        } else {
          // returning a response to the client
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("It didnt work!");
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
