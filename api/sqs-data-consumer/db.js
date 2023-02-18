const { Sequelize } = require('sequelize');
const config = require(__dirname + '/database/config/config.js');


const dbLogger = (msg) => {
    console.log('DB Logger: ', msg);
}
// your config file will be in your directory
const Connect = () => {
    console.log('Sequelize Config: ', JSON.stringify(config));
    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: 5432,
        logging: dbLogger,
        maxConcurrentQueries: 100,
        dialect: config.dialect,
        dialectOptions: {
            ssl: 'Amazon RDS'
        },
        pool: { maxConnections: 5, maxIdleTime: 30 },
        language: 'en'
    })

    try {
        sequelize.authenticate()
            .then(() => {
                console.log('Connection has been established successfully.');
                sequelize.close()
            })
            .catch(err => {
                sequelize.close()
                console.error('Unable to connect to the database:', err);
            });;
        sequelize.close()
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        sequelize.close()
    }

}

module.exports = {
    Connect
}