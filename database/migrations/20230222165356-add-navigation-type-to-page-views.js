'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('page_views', 'navigation_type', { type: Sequelize.STRING });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('page_views', 'navigation_type');
  }
};
