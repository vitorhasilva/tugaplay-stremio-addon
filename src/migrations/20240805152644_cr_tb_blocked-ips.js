/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('blocked_ips', (table) => {
  table.string('ip_address', 45).primary().comment('IP address of the user who made the request');
  table.string('reason').notNullable().comment('Reason of the block');
  table.timestamp('block_at').defaultTo(knex.fn.now()).comment('Date and time when the block was applied');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('blocked_ips');
