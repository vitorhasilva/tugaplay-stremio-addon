/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.alterTable('tugaflix', (table) => {
  table.string('subtitle').defaultTo(null);
});
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.alterTable('tugaflix', (table) => {
  table.dropColumn('subtitle');
});
