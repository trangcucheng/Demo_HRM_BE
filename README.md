# Table of Contents

-   [Table of Contents](#table-of-contents)
    -   [Technologies](#technologies)
    -   [Installation \& Setup](#installation--setup)
        -   [Install Redis:](#install-redis)
        -   [Install packages:](#install-packages)
    -   [Running the app](#running-the-app)
    -   [Generate Modules](#generate-modules)
    -   [Code First approach with TypeORM](#code-first-approach-with-typeorm)
        -   [About the relation between entities (Important)](#about-the-relation-between-entities-important)
    -   [Generate Entity \& Repository](#generate-entity--repository)
    -   [How to use Repository](#how-to-use-repository)
        -   [1. Inject Repository into Service directly.](#1-inject-repository-into-service-directly)
        -   [2. Inject Repository into DatabaseService then use it in Service. (Recommended)](#2-inject-repository-into-databaseservice-then-use-it-in-service-recommended)
    -   [Migration](#migration)
    -   [Seeding Data](#seeding-data)
    -   [Module Structure](#module-structure)
    -   [Module Naming Convention](#module-naming-convention)
    -   [RBAC (Role-Based Access Control)](#rbac-role-based-access-control)
        -   [How to use RBAC](#how-to-use-rbac)
    -   [Upload media file](#upload-media-file)
    -   [Format of API Response](#format-of-api-response)
        -   [Success Response](#success-response)
        -   [Error Response](#error-response)
    -   [Public Folder](#public-folder)
    -   [Git Branches](#git-branches)
    -   [API Documentation](#api-documentation)
    -   [API Testing](#api-testing)

## Technologies

<p align="left">
   <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white">
    <img src="https://img.shields.io/badge/node.js v18.16.1-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white">
   <img src="https://img.shields.io/badge/nestjs v10.3,0-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white">
   <img src="https://img.shields.io/badge/typeorm v0.3.17-52B0E7.svg?style=for-the-badge&logo=Sequelize&logoColor=white">
   <img src="https://img.shields.io/badge/mysql-%2300758F.svg?style=for-the-badge&logo=mysql&logoColor=white">
    <img src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white">
  </p>
</div>

## Installation & Setup

#### Install Redis:

-   MacOS:

```bash
$ brew install redis
```

-   Linux:

```bash
$ sudo apt-get install redis-server
```

-   Windows: [HERE](https://redis.io/docs/install/install-redis/install-redis-on-windows/)

**Or** you can use Docker Compose, it will come with Redis and MySQL:

```bash
$ docker-compose up -d
```

#### Install packages:

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Generate Modules

We will follow the RESTful API naming and HTTP methods convention.

Read more about [RESTful API naming convention](https://restfulapi.net/resource-naming/)

Open terminal, go to project folder and run this command:

```bash
$ npm run generate:module
```

Then, input module name and it will generate module for you.

In case you can't run the script, you can run the command below to generate module:

```bash
node_modules/.bin/nest g resource <put module name here> modules --no-spec
```

## Code First approach with TypeORM

**Read this carefully before you start coding.**

We will use Code First approach with TypeORM.

That means we will write entity file first, then TypeORM will generate table for us.

Generate table using `synchronize` feature of TypeORM.
You **have to** write specific column type in entity file.

The first way to generate table is using `synchronize` feature of TypeORM.

-   First, you need to write entity file in **`src/database/typeorm/entities`** folder.
-   Then, set `DATABASE_SYNCHRONIZE=true` in **`.env`** file.
-   Finally, run the app and TypeORM will generate table for you.
-   After that, you can set `DATABASE_SYNCHRONIZE=false` in **`.env`** file to disable synchronize feature.

The second way to generate table is using `migration` feature of TypeORM.

-   You have to write entity then write migration file with SQL query to generate table.
-   Then follow the steps in [Migration](#migration) section to run migration file.

The third way to generate table is using `schema:sync` command of TypeORM. **(Recommended)**

-   First, you need to write entity file in **`src/database/typeorm/entities`** folder.
-   Then, run this command to generate table:

```bash
$ npm run db:sync
```

-   It works like `synchronize` feature of TypeORM. But it easier to use.

**IMPORTANT:**

-   With this approach, you can use with `migration` feature of TypeORM.  
    <ins>**Caution:**</ins> If you change column config in entity file, TypeORM will drop old column and create new column for you. So, you will **lose all data** in that column or even the table. So be careful when you change column config in entity file. The properties of entity can change to whatever you want, but it's better to follow the naming convention.
-   When you use this approach, you must follow this approach for all entities. Don't use `migration` feature for some entities and `synchronize` feature for other entities. It will cause error.
-   When you use `migration` feature, you must set `DATABASE_SYNCHRONIZE=false` in **`.env`** file. And never use `synchronize` feature anymore. It will lose all data in database. **Choose one of these 2 features and stick with it.**

Read more about [TypeORM Entity](https://typeorm.io/#/entities)

---

<sup>Or you can just ignore this approach and use Migration feature instead.</br>
There are some commands to help you generate and run migration file. Check out the package.json file to see the commands.</br>
Read more about [TypeORM Migration](https://typeorm.io/#/migrations)</br>
But I would recommend you to write a very detail entity file. Especially the relation between entities. It will help you a lot in the future.</sup>

#### About the relation between entities (Important)

We use Relation in Entity to create relation between entities.

It will help us to query data from database easier.
And it will create the foreign key between tables in database.

But we don't need to create foreign key in database. It will cause error when you try to delete data in database or sync database. And will **slow down** the performance of database. If you want to keep constraint, you can do it in your code.

But we just want to create the relation, not the foreign key. So we need to set `createForeignKeyConstraints: false` in RelationOptions.

This setting will create the relation between entities, but not create the foreign key in database. That's what we want.

Read more about [Relation](https://typeorm.io/#/relations)

```typescript
    ...
    @ManyToOne(() => RoleEntity, (role: RoleEntity) => role.id, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
    role: Relation<RoleEntity>;
```

## Generate Entity & Repository

Entity:

```bash
$ npm run generate:entity
```

**Note:**

-   Input Entity name follow this format: **`entity name`**</br>
    <ins>Ex:</ins> Input `user data` => output `userData`

-   Input Table name follow this format: **`tablename`**</br>
    <ins>Ex:</ins> Input `user_data` => output `user_data`
-   Don't forget to index the column that you use to query data (or search/filter as you want). It will help you to query data faster.</br>Read more about [Index](https://typeorm.io/indices)

Repository:

```bash
$ npm run generate:repository
```

**Note:**

-   Input Repository name follow this format: **`repository name`**</br>
    <ins>Ex:</ins> input `user data` => output `userData`</br>
    **Repository name should be the same as Entity name.**

## How to use Repository

There are 2 ways to use Repository in this project.

[Inject Repository into Service directly.](#1-inject-repository-into-service-directly)</br>
[Inject Repository into DatabaseService then use it in Service. **(Recommended)**](#2-inject-repository-into-databaseservice-then-use-it-in-service-recommended)

#### 1. Inject Repository into Service directly.

In **`*.module.ts`** file, add Repository into `providers` array.

```typescript
    @Module({
        providers: [
            ...
            ExampleRepository,
        ],
        ...
    })
```

In **`*.service.ts`** file, inject Repository into Service.

```typescript
    constructor(
        private readonly exampleRepository: ExampleRepository
    ) {}

    ...

    async example() {
        return this.userDataRepository.find();
    }
```

#### 2. Inject Repository into DatabaseService then use it in Service. (Recommended)

In **`database.module.ts`** file, add Repository into `repositories` array, or add it into `providers` array.

```typescript
const repositories = [..., ExampleRepository];
```

In **`database.service.ts`** file, inject Repository into DatabaseService.

```typescript
    constructor(
        ...
        public readonly example: ExampleRepository,
    ) {}

    ...
```

In **`*.service.ts`** file, inject DatabaseService into Service.

```typescript
    constructor(
        private readonly database: DatabaseService
    ) {}

    ...

    example() {
        return this.database.example.find();
    }
```

## Migration

Migration is a way to create or update database schema. It will help you to create or update table, column, etc.
To use this feature, you need to follow these steps:

-   Write the migration script in **`migrations/init.ts`** file.

-   Run this command to run migration file:

```bash
$ npm run migration:run
```

-   Run this command to revert migration file:

```bash
$ npm run migration:revert
```

You can also generate migration file using this command:

```bash
$ npm run migration:generate --name=<migration name>
```

After that, you can import the migration file into **`migrations/configs/db.config.ts`** file and run migration command above.

Read more about [TypeORM Migration](https://typeorm.io/migrations)

## Seeding Data

Seeding data is a way to insert data into database. It will help you to insert initial data.
To use this feature, you need to follow these steps:

-   Create factory file in **`src/database/typeorm/factories`** folder.
-   Create seed file in **`src/database/typeorm/seeds`** folder.
-   Then run this command to seed data into database:

```bash
$ npm run seed:run
```

There are some examples in **`src/database/typeorm/factories`** and **`src/database/typeorm/seeds`** folder.

Read more about [Database Seeding](https://en.wikipedia.org/wiki/Database_seeding)

## Module Structure

```
migrations
public- THIS FOLDER USE FOR UPLOAD FILE, DOWNLOAD FILE, EVERYTHING RELATED TO PUBLIC.
test
src
├── app.module.ts
├── bootstrap
├── common
├── config
├── database
│   ├── typeorm
│   │   ├── entities
│   │   ├── repositories
│   │   ├── factories
│   │   ├── seeds
│   │   ├── database.module.ts
│   │   ├── database.service.ts
│
├── modules
│   ├── example
│   │   ├── dto
│   │   ├── example.controller.ts
│   │   ├── example.module.ts
│   │   ├── example.service.ts
│
├── shared
│   ├── services
│
```

When you create a new module, you need to follow the structure above.

Use `npm run generate:module` to generate module and it will create files follow the structure for you.

## Module Naming Convention

-   Module folder: **`moduleName`**. Ex: `user`, `userData`
-   File name: **`moduleName`**.(controller|module|service|dto|entity|repository).ts. Ex: `user.controller.ts`, `userData.service.ts`
-   Class name: **`ModuleName`** + (Controller|Module|Service|Dto|Entity|Repository). Ex: `UserController`, `UserDataService`
-   Column name: **`column_name`**. Ex: `first_name`, `last_name`
-   Property of entity: **`propertyName`**. Ex: `firstName`, `lastName`
-   Table name: **`table_name`**. Ex: `user_data`, `user_role`
-   Permission action: **`moduleName:actionName`**. Ex: `user:create`, `userData:findAll`

## RBAC (Role-Based Access Control)

Each API will have a permission. The permission of the API will determine what role can access the API.

Each role will have a list of permissions.

Each user has a role. The role of the user will determine what api the user can access.

Admin role will automatically have all permissions. You don't need to assign permissions to Admin role.

**<ins>Ex:</ins>** User role has a list of permissions: `post:create`, `post:findAll`, `post:update`, `post:delete`.

So, User role can create, find all, update, delete post.

### How to use RBAC

First, insert `@Permission` decorator into controller. Permission name will have format: **`moduleName:action`**.

```typescript
    @Permission('post:findAll')
    @Get()
    async findAll() {
        return this.postService.findAll();
    }
```

Then run the app and it will create permission in database for you.

```bash
$ npm run start:dev
```

The name of permission will be `Function name` + `Controller name`.

Ex: `Find all Post`.

You can see all permissions in `permissions` table.

Finally, you can assign permission to role in database.

```sql
INSERT INTO `roles_permissions` (`role_id`, `permission_id`) VALUES (1, 1);
```

If you want to bypass RBAC, you can pass `BYPASS_PERMISSION` into `@Permission` decorator. `BYPASS_PERMISSION` is imported from `'~/common/constants/constant'`.

```typescript
    @Permission(BYPASS_PERMISSION)
    @Get()
    async findAll() {
        return this.postService.findAll();
    }
```

**IMPORTANT:** You have to use `@Permission` decorator in every API. If you don't use `@Permission` decorator, the API will be blocked by default.

## Upload media file

To upload media file, you can use `/media/upload` api with `multipart/form-data` content type.

Go to Swagger API Documentation: [http://localhost:8080/docs/#/Media](http://localhost:8080/docs/#/Media)

## Format of API Response

**Note:** We have interceptors to format the response. So, you don't need to format the response manually. This is just for your information.

#### Success Response

```json
{
    "result": true,
    "message": "Success",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@email.com"
    }
}
```

Or

```json
{
    "result": true,
    "message": "Success",
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "johndoe@email.com"
        }
    ],
    "pagination": {
        "page": 1,
        "perPage": 10,
        "totalRecords": 100,
        "totalPages": 10
    }
}
```

#### Error Response

Error code will be 400, 401, 403, 404, 500, etc.

And response will return to HTTP status code.

Read more about [HTTP Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

```json
{
    "result": false,
    "message": "Unauthorized",
    "data": null,
    "statusCode": 401
}
```

Or

```json
{
    "result": false,
    "message": [
        {
            "field": "unitId",
            "error": "Đơn vị sản phẩm không tồn tại"
        },
        {
            "field": "categoryId",
            "error": "Loại sản phẩm không tồn tại"
        }
    ],
    "data": null,
    "statusCode": 400
}
```

## Public Folder

Public folder is used for upload file, download file, everything related to public.

Every files in public folder will be ignored by git.

And you can access the file in public folder by this url: `http://localhost:8080/public/<file name>`

It will return the file to you.

**DON'T PUT YOUR FILE IN **`src`** FOLDER. PUT IT IN **`public`** FOLDER.**

**AND DON'T PUT ANYTHING IMPORTANT IN PUBLIC FOLDER. EVERYONE CAN ACCESS IT.**

## Git Branches

-   `main` for Production
-   `dev` for Development
-   `feat/*` for features (new features, new APIs, etc., check out from `dev` branch)
-   `fix/*` for bug fixes (fix bugs, fix errors, etc., check out from `dev` branch)

    <sub>Maybe we will have `stg` branch for staging environment in the future. (if we or clients have budget)</sub>

`feat/*` and `fix/*` will be created from `dev` branch and will be merged into `dev` branch.

`dev` branch will be merged into `main` branch.

Create pull request to merge `feat/*` and `fix/*` branches into `dev` branch and `dev` branch into `main` branch.

## API Documentation

We use Swagger for API Documentation.

To integrate Swagger into NestJS, read more [HERE](https://docs.nestjs.com/openapi/introduction)

Swagger API Documentation: [http://localhost:8080/docs](http://localhost:8080/docs)

## API Testing

Using Jest for API Testing.

Every Module will have a test file in **`test`** folder.

```bash
# run all test
$ npm run test

# run test in watch mode
$ npm run test:watch

# run test with coverage
$ npm run test:cov
```
