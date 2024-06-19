/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('catalogo_tugakids', (table) => {
  table.string('id').primary();
  table.string('name');
  table.string('type');
  table.string('poster');
  table.string('posterShape');
  table.timestamp('addedAt').defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('catalogo_tugakids');
