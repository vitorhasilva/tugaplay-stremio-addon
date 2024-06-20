/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.raw(`
  CREATE SEQUENCE my_sequence
    START WITH 1
    INCREMENT BY 1;
`).createTable('catalogo_tugakids', (table) => {
  table.string('id').primary();
  table.string('name');
  table.string('type');
  table.string('poster');
  table.string('posterShape');
  table.integer('order').defaultTo(knex.raw('nextval(\'my_sequence\')'));
  table.timestamp('addedAt').defaultTo(knex.fn.now());
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('catalogo_tugakids').raw('DROP SEQUENCE IF EXISTS my_sequence;');
