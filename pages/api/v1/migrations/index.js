import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import { error } from "node:console";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"), //avaliar qual sistema operacional está para retorna a string
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };
    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);

      return response.status(200).json(pendingMigrations); //retorna as migrações pendentes
    }
    if (request.method === "POST") {
      const migrateMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migrateMigrations.length > 0) {
        return response.status(201).json(migrateMigrations);
      }
      return response.status(200).json(migrateMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
//precisa desse commit nessa nova branch forma didatica
