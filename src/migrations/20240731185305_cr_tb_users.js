/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('users', (table) => {
  table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()')).comment('Unique identifier for the user');
  table.string('name', 255).comment('Name of the user');
  table.string('email', 255).unique().comment('Unique email address of the user');
  table.string('password', 60).comment('Hashed password of the user');
  table.boolean('is_active').defaultTo(false).comment('Indicator if the user account is active');
  table.boolean('is_verified').defaultTo(false).comment('Indicates whether the account has been successfully verified');
  table.boolean('receive_notifications').defaultTo(true).comment('Indicates whether the user wants to receive notifications (true) or not (false).');
  table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('Date and time of the last update to the record');
  table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Date and time when the record was created');
  table.string('created_ip_address').nullable().comment('IP address from where the created request was made');
  table.string('created_user_agent').nullable().comment('User agent information of the browser/device used to make the created request');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('users');
