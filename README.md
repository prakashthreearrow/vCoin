## Sequelize Commands for DB Manipulation.

### Running Migrations:
npx sequelize-cli db:migrate

### Undoing Migrations:
npx sequelize-cli db:migrate:undo (revert most the recent migration.)
npx sequelize-cli db:migrate:undo --name 20200827192438-create-loyalty-card.js
npx sequelize-cli db:migrate:undo:all (revert all)

### Running Seeds:
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed --seed my-seeder-file.js (single file seed)

### Undoing Seeds:
npx sequelize-cli db:seed:undo (If you wish to undo the most recent seed)
npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data (If you wish to undo a specific seed)
npx sequelize-cli db:seed:undo:all (If you wish to undo all seeds)

## Run Swagger
URL : http://localhost:3002/api-docs/
# vCoin
