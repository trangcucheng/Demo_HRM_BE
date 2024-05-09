/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
});

function camelize(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function generateRepo(name) {
    console.log(`Creating repository ${name}...`);
    const repositoryPath = path.join(__dirname, `../src/database/typeorm/repositories`);
    const repositoryFilePath = path.join(repositoryPath, `${name}.repository.ts`);
    const nameCapitalized = name.capitalize();

    const repositoryTemplate = `/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ${nameCapitalized}Entity } from '~/database/typeorm/entities/${name}.entity';

@Injectable()
export class ${nameCapitalized}Repository extends Repository<${nameCapitalized}Entity> {
    constructor(private dataSource: DataSource) {
        super(${nameCapitalized}Entity, dataSource.createEntityManager());
    }
}
`;

    if (!fs.existsSync(repositoryPath)) {
        fs.mkdirSync(repositoryPath, { recursive: true });
    }

    fs.writeFileSync(repositoryFilePath, repositoryTemplate);
}

function importRepositoryToModule(name) {
    console.log(`Importing ${name} repository to module...`);
    const nameCapitalized = name.capitalize();
    const modulePath = path.join(__dirname, `../src/database/typeorm/database.module.ts`);
    const moduleContent = fs.readFileSync(modulePath, 'utf8');
    // find const repositories array in moduleContent
    const repositories = moduleContent
        .match(/const repositories = \[(.*?)\]/s)[1]
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e !== '');
    if (repositories instanceof Array) repositories.push(`${nameCapitalized}Repository`);

    // find all imports in moduleContent
    const imports = moduleContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${nameCapitalized}Repository } from '~/database/typeorm/repositories/${name}.repository';`);

    let newModuleContent = moduleContent;
    // delete all imports from moduleContent and remove empty lines above entities
    newModuleContent = newModuleContent.replace(/import \{.*?\} from .*/g, '');
    newModuleContent = newModuleContent.replace(/^\s*[\r\n]const entities/gm, 'const entities');
    newModuleContent = newModuleContent.replace(/^\s*[\r\n]const repositories/gm, 'const repositories');

    // add new imports to first line
    newModuleContent = `${imports.join('\n')}\r\n\r\n${newModuleContent}`;

    // write repositories to moduleContent
    newModuleContent = newModuleContent.replace(
        /const repositories = \[(.*?)\]/s,
        `\r\nconst repositories = [\n    ${repositories.join(',\n    ')},\n]`,
    );

    // write moduleContent to modulePath
    fs.writeFileSync(modulePath, newModuleContent);
}

function importRepositoryToService(name) {
    console.log(`Importing ${name} repository to service...`);
    const nameCapitalized = name.capitalize();
    const servicePath = path.join(__dirname, `../src/database/typeorm/database.service.ts`);
    const serviceContent = fs.readFileSync(servicePath, 'utf8');

    // find all constructors in serviceContent
    const constructors = serviceContent
        .match(/constructor\((.*?)\)/s)[1]
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e !== '');
    if (constructors instanceof Array) constructors.push(`public readonly ${name}: ${nameCapitalized}Repository`);

    // find all imports in serviceContent
    const imports = serviceContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${nameCapitalized}Repository } from '~/database/typeorm/repositories/${name}.repository';`);

    let newServiceContent = serviceContent;
    // delete all imports from moduleContent and remove empty lines
    newServiceContent = newServiceContent.replace(/import \{.*?\} from .*/g, '');
    newServiceContent = newServiceContent.replace(/^\s*[\r\n]@Injectable/gm, '@Injectable');

    // add new imports to first line
    newServiceContent = `${imports.join('\n')}\r\n\r\n${newServiceContent}`;

    // write repositories to newServiceContent's constructor
    newServiceContent = newServiceContent.replace(/constructor\((.*?)\)/s, `constructor(\n        ${constructors.join(',\n        ')},\n    )`);

    // write newServiceContent to servicePath
    fs.writeFileSync(servicePath, newServiceContent);
}

function generateEntity(tableName, entityName) {
    console.log(`Creating entity ${entityName}...`);
    const entityPath = path.join(__dirname, `../src/database/typeorm/entities`);
    const entityFilePath = path.join(entityPath, `${entityName}.entity.ts`);
    const nameCapitalized = entityName.capitalize();

    const entityTemplate = `import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: '${tableName}' })
export class ${nameCapitalized}Entity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;
}
`;

    if (!fs.existsSync(entityPath)) {
        fs.mkdirSync(entityPath, { recursive: true });
    }

    fs.writeFileSync(entityFilePath, entityTemplate);
}

function importEntityToModule(name) {
    console.log(`Importing ${name} entity to module...`);
    const nameCapitalized = name.capitalize();
    const modulePath = path.join(__dirname, `../src/database/typeorm/database.module.ts`);
    const moduleContent = fs.readFileSync(modulePath, 'utf8');
    // find const entities array in moduleContent
    const entities = moduleContent
        .match(/const entities = \[(.*?)\]/s)[1]
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e !== '');
    if (entities instanceof Array) entities.push(`${nameCapitalized}Entity`);

    // find all imports in moduleContent
    const imports = moduleContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${nameCapitalized}Entity } from '~/database/typeorm/entities/${name}.entity';`);

    let newModuleContent = moduleContent;
    // delete all imports from moduleContent and remove empty lines
    newModuleContent = newModuleContent.replace(/import \{.*?\} from .*/g, '');
    newModuleContent = newModuleContent.replace(/^\s*[\r\n]const entities/gm, 'const entities');

    // add new imports to first line
    newModuleContent = `${imports.join('\n')}\r\n\r\n${newModuleContent}`;

    // write entities to moduleContent
    newModuleContent = newModuleContent.replace(/const entities = \[(.*?)\]/s, `const entities = [\n    ${entities.join(',\n    ')},\n]`);

    // write moduleContent to modulePath
    fs.writeFileSync(modulePath, newModuleContent);
}

function generateModule(moduleName) {
    console.log(`Creating module ${moduleName}...`);
    const pascalName = camelize(moduleName).charAt(0).toUpperCase() + camelize(moduleName).slice(1);
    const camelName = camelize(moduleName);
    const modulePath = path.join(__dirname, `../src/modules`, moduleName);
    const moduleFilePath = path.join(__dirname, `../src/modules`, moduleName, `${moduleName}.module.ts`);
    const controllerFilePath = path.join(__dirname, `../src/modules`, moduleName, `${moduleName}.controller.ts`);
    const serviceFilePath = path.join(__dirname, `../src/modules`, moduleName, `${moduleName}.service.ts`);
    const createDtoFilePath = path.join(__dirname, `../src/modules`, moduleName, `dto/create-${moduleName}.dto.ts`);
    const updateDtoFilePath = path.join(__dirname, `../src/modules`, moduleName, `dto/update-${moduleName}.dto.ts`);

    // create module folder
    if (!fs.existsSync(modulePath)) {
        fs.mkdirSync(modulePath, { recursive: true });

        // create dto folder
        fs.mkdirSync(path.join(modulePath, 'dto'), { recursive: true });
    }

    // create module file
    const moduleTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/module.template`), 'utf8');
    const moduleContent = moduleTemplate
        .replace(/{{moduleName}}/g, moduleName)
        .replace(/{{name}}/g, camelName)
        .replace(/{{nameCapitalized}}/g, pascalName);
    fs.writeFileSync(moduleFilePath, moduleContent);

    const controllerTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/controller.template`), 'utf8');
    const controllerContent = controllerTemplate
        .replace(/{{moduleName}}/g, moduleName)
        .replace(/{{name}}/g, camelName)
        .replace(/{{nameCapitalized}}/g, pascalName);
    fs.writeFileSync(controllerFilePath, controllerContent);

    const serviceTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/service.template`), 'utf8');
    const serviceContent = serviceTemplate
        .replace(/{{moduleName}}/g, moduleName)
        .replace(/{{name}}/g, camelName)
        .replace(/{{nameCapitalized}}/g, pascalName);
    fs.writeFileSync(serviceFilePath, serviceContent);

    const createDtoTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/create-dto.template`), 'utf8');
    const createDtoContent = createDtoTemplate
        .replace(/{{moduleName}}/g, moduleName)
        .replace(/{{name}}/g, camelName)
        .replace(/{{nameCapitalized}}/g, pascalName);
    fs.writeFileSync(createDtoFilePath, createDtoContent);

    const updateDtoTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/update-dto.template`), 'utf8');
    const updateDtoContent = updateDtoTemplate
        .replace(/{{moduleName}}/g, moduleName)
        .replace(/{{name}}/g, camelName)
        .replace(/{{nameCapitalized}}/g, pascalName);
    fs.writeFileSync(updateDtoFilePath, updateDtoContent);

    importToAppModule(moduleName, pascalName);
}

function importToAppModule(moduleName, pascalName) {
    // import module to app.module.ts
    const appModulePath = path.join(__dirname, `../src/app.module.ts`);
    const appModuleContent = fs.readFileSync(appModulePath, 'utf8');

    // find all imports in appModuleContent
    const imports = appModuleContent.match(/import .*? from .*/g);
    if (imports instanceof Array) imports.push(`import { ${pascalName}Module } from '~/modules/${moduleName}/${moduleName}.module';`);

    let newAppModuleContent = appModuleContent;
    // delete all imports from appModuleContent and remove empty lines
    newAppModuleContent = newAppModuleContent.replace(/import .*? from .*/g, '');
    newAppModuleContent = newAppModuleContent.replace(/^\s*[\r\n]@Module/gm, '@Module');

    // add new imports to first line
    newAppModuleContent = `${imports.join('\n')}\r\n\r\n${newAppModuleContent}`;

    // write modules to appModuleContent
    newAppModuleContent = newAppModuleContent.replace(/(imports:\s*\[)([^]*?)(    \])/m, (_, start, imports, end) => {
        const importArray = imports.split(',');
        importArray.splice(importArray.length - 1, 0, `\n        ${pascalName}Module`);
        const updatedImports = importArray.join(',').trim();
        return `${start}\n        ${updatedImports}\n${end}`;
    });

    // write newAppModuleContent to appModulePath
    fs.writeFileSync(appModulePath, newAppModuleContent);
}

module.exports = {
    camelize,
    generateRepo,
    importRepositoryToModule,
    importRepositoryToService,
    generateEntity,
    importEntityToModule,
    generateModule,
};
