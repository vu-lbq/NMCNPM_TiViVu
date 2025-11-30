const models = require("./src/models");

async function main() {
    try {
        const force = process.env.DB_FORCE === 'true';
        const alter = process.env.DB_ALTER !== 'false'; // default true for dev convenience
        await models.sequelize.sync({ force, alter });
        console.log(`Database synced (force=${force}, alter=${alter})`);
        process.exit(0);
    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

main();
