const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const users = [
  {
    username: 'admin01',
    email: 'admin@edulib.edu',
    password: 'password123',
    role: 'Admin'
  },
  {
    username: 'librarian01',
    email: 'librarian@edulib.edu',
    password: 'password123',
    role: 'Librarian'
  },
  {
    username: 'faculty01',
    email: 'prof.smith@edulib.edu',
    password: 'password123',
    role: 'Faculty'
  },
  {
    username: 'student23',
    email: 'student@edulib.edu',
    password: 'password123',
    role: 'Student'
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    // Use User.create instead of insertMany to trigger pre('save') hooks for bcrypt hashing
    for (const user of users) {
      await User.create(user);
    }
    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
