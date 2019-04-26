let store;

module.exports = {
  createSessionStore: session => {
    const MongoDBStore = require('connect-mongodb-session')(session);
    store = new MongoDBStore({
      uri: 'mongodb://localhost:27017/ChainReaction',
      collection: 'sessions'
    });
    return store;
  },
  store: () => {
    if (!store) return new Error('Store not initialized!');
    return store;
  }
};