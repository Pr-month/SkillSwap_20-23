export type DatabaseConfig = {
  type: 'postgres';
  applicationName: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

export type PostgresConfig = {
  user: string;
  password: string;
  db: string;
};

export type PgAdminConfig = {
  email: string;
  password: string;
};

export type JwtConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiration: string;
  refreshExpiration: string;
};

export type FileUploadConfig = {
  destination: string;
  limit: number;
};

export type AppConfig = {
  port: number;
  env: string;
  db: DatabaseConfig;
  postgres: PostgresConfig;
  pgadmin: PgAdminConfig;
  jwt: JwtConfig;
  fileUploads: FileUploadConfig;
};