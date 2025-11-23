const path = require('path');

module.exports = {
  development: {
    database: path.join(__dirname, '../../data/database/interview.db'),
    logging: true
  },
  production: {
    database: process.env.DB_PATH || path.join(__dirname, '../../data/database/interview.db'),
    logging: false
  }
};
