const { Exercises, Users } = require('./models');

const Router = require('express').Router();

Router.post('/new-user', (req, res, next) => {
  
  const user = new Users(req.body);
  
  user.save((err, savedUser) => {
    
    if(err) {
      
      if(err.code === 11000) {
        
        return next({
          
          status: 400,
          message: 'username already taken'
        });
        
      } else return next(err);
      
    }

    res.json({
      username: savedUser.username,
      _id: savedUser._id
    });
    
    
  });
});

Router.post('/add', (req, res, next) => {
  
  Users.findById(req.body.userId, (err, user) => {
    
    if(err) return next(err);
    
    if(!user) {
      
      return next({
        status: 400,
        message: 'unknown _id'
      });
    }
    
    const exercise = new Exercises(req.body);
    
    exercise.username = user.username;
    
    exercise.save((err, savedExercise) => {
      
      if(err) return next(err);
      
      savedExercise = savedExercise.toObject();
      
      delete savedExercise.__v;
      
      savedExercise._id = savedExercise.userId;
      
      delete savedExercise.userId;
      
      savedExercise.date = (new Date(savedExercise.date)).toDateString();
      
      res.json(savedExercise);
      
    });
  });
});

Router.get('/users', (req,res,next) => {
  
  Users.find({}, (err, data) => {
    
    res.json(data)
  });
});

Router.get('/log', (req, res, next) => {
  
  const from = new Date(req.query.from);
  
  const to = new Date(req.query.to);

  Users.findById(req.query.userId, (err, user) => {
    
    if(err) return next(err);
    
    if(!user) {
      
      return next({status:400, message: 'unknown userId'})
    };
    
    
    Exercises.find({
      
      userId: req.query.userId,
      
        date: {
          $lt: to != 'Invalid Date' ? to.getTime() : Date.now() ,
          $gt: from != 'Invalid Date' ? from.getTime() : 0
        }
      }, {
        __v: 0,
        _id: 0
      })
    .sort('-date')
    .limit(parseInt(req.query.limit))
    .exec((err, exercises) => {
      
      if(err) return next(err);
      
      res.json({
          _id: req.query.userId,
          username: user.username,
          from : from != 'Invalid Date' ? from.toDateString() : undefined,
          to : to != 'Invalid Date' ? to.toDateString(): undefined,
          count: exercises.length,
          log: exercises.map(e => ({
            description : e.description,
            duration : e.duration,
            date: e.date.toDateString()
          })
        )
      });
    });
  });
});

module.exports.Router = Router;
