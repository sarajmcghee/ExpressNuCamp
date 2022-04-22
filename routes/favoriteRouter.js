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
            .then(favorite => {
                console.log('FAVORITE ', favorite);
                let addingFavorite = new Array();
                let trip = null;
                //Found Favorite
                if (favorite !== null) {
                    //For Each Favorite Requested
                    req.body.forEach((test) => {
                        console.log('@@@@@@@@@@@@@@ ', test._id);
                        //Look through Favorited Campsites to Add
                        favorite.campsites.forEach((item) => {
                            console.log('22222222', item, test._id);
                            const s1 = item.toString();
                            const s2 = test._id.toString();
                            if (s1.includes(s2)) {
                                console.log('Favorites Already Added', item, test._id);
                                trip = 1;
                            }
                            else {
                                console.log('Adding Favorite', item, test._id);

                            }
                            //             res.statusCode = 200;
                            //             res.setHeader('Content-Type', 'application/json');
                            //             res.json(campsite);
                            //         })
                            //         .catch(err => next(err));

                        });
                        if (trip !== 1) {
                            addingFavorite.push(test._id);
                            trip = null;
                        }
                    });

                    //If there is things to ADD
                    if (trip === null) {
                        console.log('CLEAN', addingFavorite,favorite.campsites);
                        
                        addingFavorite.forEach((item) => {

                            favorite.campsites.push(item.toString());

                        });
                        favorite.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                    }



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
    //sdfsdfsdf
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                console.log('FAVORITE ', favorite);
                //Found Favorite
                if (favorite !== null) {
                    //loop through favorites
                    favorite.campsites.forEach(function (item) {
                        let strItem = item.toString();
                        let strCamp = req.params.campsiteId.toString();
                        if (strItem.includes(strCamp)) {
                            res.end('Favorite Already Included');
                        }
                        else {
                            console.log('Favorite needs to added', req.params.campsiteId);

                            //                             console.log('Favorite campsites',favorite.campsites);
                            //                              favorite.save()
                            //                                   .then(favorite => {
                            //                                       res.statusCode = 200;
                            //                                     res.setHeader('Content-Type', 'application/json');
                            //   res.json(favorite.campsites(req.params.campsiteId));
                            //                                   })
                            //                                   .catch(err => next(err));
                            //                           }
                            //   });
                        }
                    });

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

    //dfgdfg
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                console.log('FAVORITE ', favorite);
                //Found Favorite
                if (favorite !== null) {
                    favorite.findOneAndDelete({ campsites: req.params.campsiteId })
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }


                else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(`You do not have any favorites to delete`);
                }
            });

    })

module.exports = favoriteRouter;