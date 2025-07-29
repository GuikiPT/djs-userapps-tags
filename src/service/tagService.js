const { initDatabase } = require('../database/connector');
const Tag = require('../database/models/UserTag');

class TagService {
    static initialized = false;

    static async initialize() {
        if (this.initialized) return;

        const connected = await initDatabase();
        if (!connected) {
            throw new Error('Database initialization failed');
        }

        await Tag.sync();
        this.initialized = true;
    }

    static async upsertTag(ownerId, name, content) {
        await this.initialize();
        const [tag] = await Tag.upsert(
            { ownerId, name, content },
            { returning: true }
        );
        return tag;
    }

    static async getTag(ownerId, name) {
        await this.initialize();
        return Tag.findOne({ where: { ownerId, name } });
    }

    static async listTags(ownerId) {
        await this.initialize();
        return Tag.findAll({
            where: { ownerId },
            order: [['name', 'ASC']],
        });
    }

    static async deleteTag(ownerId, name) {
        await this.initialize();
        return Tag.destroy({ where: { ownerId, name } });
    }
}

module.exports = TagService;
