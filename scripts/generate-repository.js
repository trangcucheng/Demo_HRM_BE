/* eslint-disable @typescript-eslint/no-var-requires */
const { camelize, generateRepo, importRepositoryToModule, importRepositoryToService } = require('./function');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Input repository name (repo name): `, (name) => {
    name = camelize(name.toLowerCase());
    generateRepo(name);
    importRepositoryToModule(name);
    importRepositoryToService(name);
    console.log(`Done!`);
    readline.close();
});
