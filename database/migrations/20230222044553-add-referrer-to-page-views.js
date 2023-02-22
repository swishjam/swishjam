'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('page_views', 'referrer_full_url', { type: Sequelize.STRING });
    await queryInterface.addColumn('page_views', 'referrer_url_host', { type: Sequelize.STRING });
    await queryInterface.addColumn('page_views', 'referrer_url_path', { type: Sequelize.STRING });
    await queryInterface.addColumn('page_views', 'referrer_url_query', { type: Sequelize.STRING });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
