#!/bin/bash
set -e

# Preferable option
#psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
#    GRANT ALL ON ALL TABLES IN SCHEMA public TO "$DB_USER";
#EOSQL

# Дает все права на все
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
    GRANT ALL PRIVILEGES ON SCHEMA public TO "$DB_USER";
EOSQL