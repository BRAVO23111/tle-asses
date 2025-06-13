import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email : {
    type: String,
    required: true,
    unique: true
  },
  contact : {
    type: String,
    required: true
  },
  codeforcesId: {
    type: String,
    required: true,
  },
  currentRating: {
    type: Number,
    required: true,
    default: 0
  },
  maxRating: {
    type: Number,
    required: true,
    default: 0
  }
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
