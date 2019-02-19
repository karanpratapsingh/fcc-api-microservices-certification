const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Exercises = new Schema({
  
  description: {
    type: String,
    required: true,
    maxlength: [20, 'description too long']
  },
  duration: {
    
    type: Number,
    required: true,
    min: [1, 'duration too short']
  },
  date: {
    
    type: Date,
    default: Date.now
  },
  username: String,
  userId: {
    
    type: String,
    ref: 'Users',
    index: true
  }
});

Exercises.pre('save', (next) => {
  
  mongoose.model('Users').findById(this.userId, (err, user) => {
    
    if(err) return next(err);
    
    if(!user) {
      
      const err = new Error('unknown userId');
      
      return next(err.status = 400);
    }
    
    this.username = user.username;
    
    if(!this.date) {
      
      this.date = Date.now();
    }
    next();
  });
});


module.exports.Exercises = mongoose.model('Exercises', Exercises);


let Users = new Schema({
  
  username: {
    
    type: String, 
    required: true,
    unique: true,
    maxlength: [20, 'username too long']
  },
  _id: {
    type: String,
    index: true,
    default: require('shortid').generate
  }
});

module.exports.Users = mongoose.model('Users', Users)