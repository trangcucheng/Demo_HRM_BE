/* eslint-disable @typescript-eslint/no-var-requires */
const { camelize, generateEntity, importEntityToModule } = require('./function');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Input Entity name (entity name): `, (name) => {
    readline.question(`Input Table name (table_name): `, (table) => {
        name = camelize(name.toLowerCase());
        generateEntity(table.toLowerCase(), name);
        importEntityToModule(name);
        console.log(`Done!`);
        readline.close();
    });
});
