#!/bin/bash
set -e

if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_DB" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
  echo "Ошибка: не все переменные окружения установлены"
  exit 1
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER "$DB_USER" PASSWORD '$DB_PASSWORD';
    CREATE DATABASE "$DB_NAME";
    GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
EOSQL
