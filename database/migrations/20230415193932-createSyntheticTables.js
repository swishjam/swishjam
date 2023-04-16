'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('synthetic_runs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      uuid: { type: Sequelize.STRING, unique: true, allowNull: false },
      project_key: { type: Sequelize.STRING, allowNull: false },
      full_url: { type: Sequelize.STRING, allowNull: false },
      url_host: { type: Sequelize.STRING, allowNull: false },
      url_path: { type: Sequelize.STRING, allowNull: false },
      url_query: { type: Sequelize.STRING, allowNull: false },
      user_agent: { type: Sequelize.STRING },
      browser_name: { type: Sequelize.STRING },
      browser_version: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      connectivity: { type: Sequelize.STRING },
      bandwidth_down: { type: Sequelize.INTEGER },
      bandwidth_up: { type: Sequelize.INTEGER },
      is_mobile: { type: Sequelize.BOOLEAN },
      bytes_out: { type: Sequelize.INTEGER },
      bytes_out_doc: { type: Sequelize.INTEGER },
      bytes_in: { type: Sequelize.INTEGER },
      bytes_in_doc: { type: Sequelize.INTEGER },
      load_event_start: { type: Sequelize.INTEGER },
      load_event_end: { type: Sequelize.INTEGER },
      dom_content_loaded_event_start: { type: Sequelize.INTEGER },
      dom_content_loaded_event_end: { type: Sequelize.INTEGER },
      dom_interactive: { type: Sequelize.INTEGER },
      first_paint: { type: Sequelize.INTEGER },
      first_contentful_paint: { type: Sequelize.INTEGER },
      first_meaningful_paint: { type: Sequelize.INTEGER },
      largest_contentful_paint: { type: Sequelize.INTEGER },
      time_to_first_byte: { type: Sequelize.INTEGER },
      dom_complete: { type: Sequelize.INTEGER },
      total_blocking_time: { type: Sequelize.INTEGER },
      cumulative_layout_shift: { type: Sequelize.DECIMAL },
      max_first_input_delay: { type: Sequelize.INTEGER },
      speed_index: { type: Sequelize.INTEGER },
      visual_complete_85: { type: Sequelize.INTEGER },
      num_dom_elements: { type: Sequelize.INTEGER },
      lighthouse_performance_score: { type: Sequelize.DECIMAL },
      html_bytes: { type: Sequelize.INTEGER },
      javascript_bytes: { type: Sequelize.INTEGER },
      css_bytes: { type: Sequelize.INTEGER },
      image_bytes: { type: Sequelize.INTEGER },
      font_bytes: { type: Sequelize.INTEGER },
      video_bytes: { type: Sequelize.INTEGER },
      other_bytes: { type: Sequelize.INTEGER },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      completed_at: { allowNull: false, type: Sequelize.DATE }
    });
    await queryInterface.addIndex('synthetic_runs', ['project_key']);
    await queryInterface.addIndex('synthetic_runs', ['url_host']);
    await queryInterface.addIndex('synthetic_runs', ['url_path']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('synthetic_runs');
  }
};
