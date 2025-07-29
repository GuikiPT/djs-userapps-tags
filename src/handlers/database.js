const { sequelize, initDatabase } = require('../database/connector');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

const loadModels = () => {
    const modelsPath = path.join(__dirname, '../database/models');
    if (!fs.existsSync(modelsPath)) {
        fs.mkdirSync(modelsPath, { recursive: true });
        console.log(colors.green('Created models directory.'));
        return;
    }
    
    const modelFiles = fs.readdirSync(modelsPath)
        .filter(file => file.endsWith('.js'));
    
    for (const file of modelFiles) {
        try {
            require(path.join(modelsPath, file));
            console.log(colors.green(`Loaded model: ${file}`));
        } catch (error) {
            console.error(colors.red(`Error loading model ${file}: ${error.stack}`));
        }
    }
};

module.exports = async (client) => {
    try {
        const connected = await initDatabase();
        if (!connected) {
            console.error(colors.red('Failed to initialize database. Bot may not function correctly.'));
            return;
        }

        const modelsPath = path.join(__dirname, '../database/models');
        
        if (!fs.existsSync(modelsPath)) {
            fs.mkdirSync(modelsPath, { recursive: true });
            console.log(colors.green('Created models directory.'));
        }
        
        loadModels();

        try {
            await sequelize.sync();
            console.log(colors.green('Database synchronized successfully.'));
        } catch (error) {
            console.error(colors.red(`Error synchronizing database: ${error.stack}`));
        }

        client.db = sequelize;
        
        console.log(colors.green('Database handler initialized successfully.'));
    } catch (error) {
        console.error(colors.red(`Database initialization error: ${error.stack}`));
    }
};
