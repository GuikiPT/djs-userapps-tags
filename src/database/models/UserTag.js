const { DataTypes } = require('sequelize');
const { sequelize } = require('../connector');

const UserTag = sequelize.define('UserTag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ownerId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'user_tags',
    indexes: [
        {
            unique: true,
            fields: ['ownerId', 'name']
        }
    ]
});

module.exports = UserTag;
