/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('api_requests', (table) => {
  table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()')).comment('Unique identifier for the request');
  table.uuid('user_id').references('id').inTable('users').notNullable()
    .onDelete('CASCADE')
    .comment('Identifier of the user who made the request');
  table.string('ip_address', 45).notNullable().comment('IP address of the user who made the request');
  table.string('user_agent', 255).notNullable().comment('User agent of the browser or client that made the request');
  table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Date and time when the request was made');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('api_requests');
