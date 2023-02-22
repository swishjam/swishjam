'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('page_views', 'left_page_at_ts', { type: Sequelize.DATE });
    
    await queryInterface.removeColumn('page_views', 'page_view_ts');
    await queryInterface.addColumn('page_views', 'page_view_ts', {
      type: Sequelize.DATE,
      allowNull: false
    });
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
