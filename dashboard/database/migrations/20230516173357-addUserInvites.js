'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_invites', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.fn('uuid_generate_v4'),
        allowNull: false,
        primaryKey: true
      },
      organization_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'organizations', key: 'id' }},
      invited_by_user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }},
      accepted_by_user_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }},
      invite_token: { type: Sequelize.STRING, unique: true, allowNull: false },
      invited_email: { type: Sequelize.STRING, allowNull: false },
      accepted_at: { type: Sequelize.DATE },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('user_invites');
  }
};
