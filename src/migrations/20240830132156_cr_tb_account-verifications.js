/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('account_verifications', (table) => {
  table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()')).comment('Primary key, unique identifier for each verification record');
  table.uuid('user_id').references('id').inTable('users').notNullable()
    .onDelete('CASCADE')
    .comment('Foreign key referencing the users table, links the verification to a specific user');
  table.string('verification_token', 255).notNullable().comment('The token sent to the user for account verification');
  table.boolean('is_verified').defaultTo(false).comment('Indicates whether the account has been successfully verified');
  table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Timestamp indicating when the verification record was created');
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTableIfExists('account_verifications');
