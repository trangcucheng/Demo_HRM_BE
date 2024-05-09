/* eslint-disable @typescript-eslint/no-var-requires */
const { generateModule } = require('./function');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Input module name (module-name): `, (name) => {
    // name must be in this-format-with-dashes
    generateModule(name.toLowerCase());
    console.log(`Done!`);
    readline.close();
});
