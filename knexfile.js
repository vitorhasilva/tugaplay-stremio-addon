// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'postgresql',
    connection: 'postgres://lymfpgtx:hPorgD6ySRDBJ8eSxb6bjzq9YBxoJrR4@flora.db.elephantsql.com/lymfpgtx?ssl',
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'migrations/',
    },
  },

  staging: {
    client: 'postgresql',
    connection: 'postgres://lymfpgtx:hPorgD6ySRDBJ8eSxb6bjzq9YBxoJrR4@flora.db.elephantsql.com/lymfpgtx?ssl',
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'migrations/',
    },
  },

};
