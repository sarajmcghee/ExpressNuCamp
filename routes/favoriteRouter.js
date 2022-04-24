const express = require('express');
const Favorite = require('../models/favorite');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('favorite.user')
            .populate('favorite.campsites')
            .then(favorite => {
                console.log('Favorite found', favorite, favorite.user, favorite.campsites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                //Found Favorite
                if (favorite) {

                    for (let i = 0; i < req.body.length; i++) {
                        if (favorite.campsites.indexOf(req.body[i]._id) === -1) {
                            console.log('Favorite created');
                            favorite.campsites.push(req.body[i]._id);
                        }

                    }
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));

                }
                else {
                    req.body.user = req.user._id;
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            favorite.save();
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));

                }
            })
            .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(
                favorite => {
                    if (favorite) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    } else {
                        res.setHeader('Content-Type', 'text/plain');
                        res.end(`You do not have any favorites to delete`);
                    }
                })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Get operation not supported on /favorites`);
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                console.log('FAVORITE ', favorite);
                //Found Favorite
                if (favorite) {
                    for (let i = 0; i < req.body.length; i++) {
                        if (favorite.campsites.indexOf(req.params.campsiteId) === -1) {
                            console.log('Favorite created', req.params.campsiteId);
                            favorite.campsites.push(req.params.campsiteId);
                        }

                    }
                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));

                }
                else {
                    req.body.user = req.user._id;
                    Favorite.create({ user: req.user._id, campsites: req.params.campsiteId })
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            favorite.save();
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));

                }
            })
            .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PutT operation not supported on /favorites`);
    })


    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndDelete(req.params.campsiteId)
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            });


    })

module.exports = favoriteRouter;