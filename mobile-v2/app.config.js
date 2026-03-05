const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  expo: {
    ...require('./app.json').expo,
  },
};
