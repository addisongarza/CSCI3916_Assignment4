/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
var Purchase = require('./Purchases');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});





router.post('/frontend', function (req, res) {
    var new_purchase = new Purchase();

    new_purchase.name = req.body.name;
    new_purchase.address = req.body.address;
    new_purchase.cc = req.body.cc;
    new_purchase.product_id = req.body.product_id;
    new_purchase.order_number = req.body.order_number;
    new_purchase.euro_price = req.body.euro_price;
    new_purchase.region_currency = req.body.region_currency;
    new_purchase.region_price = req.body.region_price;

    new_purchase.save(function(err){
        if (err) {
            if (err.code == 11000)
                return res.json({ success: false, message: 'review failed to save.'});
            else
                return res.json(err);
        }
    });
    return res.json({success: true, msg: 'Successfully saved purchase.'});
});






router.route('/movies')
    .post(function(req, res) {
        if (!req.body.title || !req.body.year || !req.body.genre || !req.body.cast) {
            res.json({success: false, msg: 'Please include all data.'});
            return;
        }

        var new_movie = new Movie();

        new_movie.title = req.body.title;
        new_movie.year = req.body.year;
        new_movie.genre = req.body.genre;
        new_movie.cast = req.body.cast;

        new_movie.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A movie with that name already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new movie.'})
        });
        }
    )
    .get(function(req, res) {
            console.log(req.body);
            // set status code

            let id = " ";
            if (req.body.movie) {
                id = req.body.movie;
            }
            if (req.headers.movie) {
                id = req.headers.movie;
            }

            if (req.headers.movie) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    // Movie.findById(id, function(err, movie) {
                    if (movie) {
                        Review.findOne({ movie: id }).select('reviewer_name rating movie review').exec(function(err, review) {
                            if(review) {
                                //var review_json = JSON.stringify(review);
                                res.json({status: 200, success: true, movies: movie, reviews: review});
                            } else {
                                return res.json({ success: true, movies: movie});
                            }
                        });
                    } else {
                        return res.json({ success: false, message: 'movie not in database.'});
                    }
                })
            }
            else if (!req.body) {
                Movie.find(function (err, movies) {
                    if (err) res.send(err);
                    return res.json({status:200, success: true, size: movies.length, movies: movies});
                });
            }
            else if (!req.body.movie) {
                Movie.find(function (err, movies) {
                    if (err) res.send(err);
                    return res.json({status:200, success: true, size: movies.length, movies: movies});
                });
            } else if (req.body.movie && !req.body.reviews) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    // Movie.findById(id, function(err, movie) {
                    if (movie) {
                        return res.json({ success: true, movies: movie});
                    } else {
                        return res.json({ success: false, message: 'movie not in database.'});
                    }
                })
            } else if (req.body.movie && req.body.reviews == false) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    // Movie.findById(id, function(err, movie) {
                    if (movie) {
                        return res.json({ success: true, movies: movie});
                    } else {
                        return res.json({ success: false, message: 'movie not in database.'});
                    }
                })
            } else if (req.body.movie && req.body.reviews == true) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    // Movie.findById(id, function(err, movie) {
                    if (movie) {
                        Review.findOne({ movie: id }).select('reviewer_name rating movie review').exec(function(err, review) {
                            if(review) {
                                //var review_json = JSON.stringify(review);
                                res.json({status: 200, success: true, movies: movie, reviews: review});
                            } else {
                                return res.json({ success: true, movies: movie});
                            }
                        });
                    } else {
                        return res.json({ success: false, message: 'movie not in database.'});
                    }
                })
            }
    }
    )
    .put(function(req, res) {
            // should be jauth
            // .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);

            let id = req.body.id;
            Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
            // Movie.findById(id, function(err, movie) {
                if (err) {
                    if (err.kind === "ObjectId") {
                        res.status(404).json({
                            success: false,
                            message: `No movie with id: ${id} in the database!`
                        }).send();
                    } else {
                        res.send(err);
                    }
                } else if (movie) {
                    if (req.body.title) {
                        movie.title = req.body.title;
                    }
                    if (req.body.year) {
                        movie.year = req.body.year;
                    }
                    if (req.body.genre) {
                        movie.genre = req.body.genre;
                    }
                    if (req.body.cast) {
                        movie.cast = req.body.cast;
                    }
                    movie.save(function (err) {
                        if (err) res.send(err);

                        res.status(200).json({
                            success: true,
                            message: 'Movie updated!'
                        });
                    });
                }
            })
        }
    )
    .delete(function(req, res) {
        // should be auth
        // .delete(authController.isAuthenticated, function(req, res) {
        console.log(req.body);

        let id = req.body.id;
        Movie.findOne({ title: id }).select('_id title year genre cast').exec(function(err, movie) {
            if (err) {
                if (err.kind === "ObjectId") {
                    res.status(404).json({
                        success: false,
                        message: `No movie with id: ${id} in the database!`
                    }).send();
                } else {
                    res.send(err);
                }
            } else if (movie) {
                Movie.remove({_id: movie._id}, function(err, movie) {
                    if (err) {
                        if (err.kind === "ObjectId") {
                            res.status(404).json({
                                success: false,
                                message: `No movie with id: ${id} in the database!`
                            }).send();
                        } else {
                            res.send(err);
                        }
                    } else {
                        res.status(200).json({
                            success: true,
                            message: 'Successfully deleted'
                        })
                    }
                });
            }
        })
    }
    )
;




router.route('/reviews')
    .post(function(req, res) {
        if (!req.body.reviewer_name || !req.body.rating || !req.body.movie || !req.body.review) {
            res.json({success: false, msg: 'Please include all data.'});
            return;
        }

        var new_rev = new Review();

        new_rev.reviewer_name = req.body.reviewer_name;
        new_rev.rating = req.body.rating;
        new_rev.movie = req.body.movie;
        new_rev.review = req.body.review;

        let id = req.body.movie;

        Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
            // Movie.findById(id, function(err, movie) {
            if (!movie) {
                return res.json({ success: false, message: 'movie does not exist.'});
            } else if (movie) {
                new_rev.save(function(err){
                    if (err) {
                        if (err.code == 11000)
                            return res.json({ success: false, message: 'review failed to save.'});
                        else
                            return res.json(err);
                    }

                    res.json({success: true, msg: 'Successfully created new review.'})
                });
            }
        })

        }
    )
    .get(function(req, res) {
        if (!req.body.id) {
            res.json({success: false, msg: 'Please include all data.'});
            return;
        }

        // check if movie exists
        let id = req.body.id;
        Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
            // Movie.findById(id, function(err, movie) {
            if (movie) {
                Review.findOne({ movie: id }).select('reviewer_name rating movie review').exec(function(err, review) {
                    if(review) {
                        //var review_json = JSON.stringify(review);
                        res.json({status: 200, success: true, reviews: review});
                    } else {

                    }
                });
            } else {
                return res.json({ success: false, message: 'movie does not exist.'});
            }
        })



        }
    )
;





app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only

