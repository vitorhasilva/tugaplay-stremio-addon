// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  local: {
    client: 'postgresql',
    connection: process.env.DB_SSL === 'true' ? `${process.env.DB_URL}?ssl=true` : process.env.DB_URL,
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'src/migrations/',
    },
  },

  online: {
    client: 'postgresql',
    connection: process.env.DB_SSL === 'true' ? `${process.env.DB_URL}?ssl=true` : process.env.DB_URL,
    debug: false,
    pool: {
      min: 0,
      max: 50,
    },
    migrations: {
      directory: 'src/migrations/',
    },
  },

};
