#!/bin/bash
set -e

# Create the application user and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the application user if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
            CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
        END IF;
    END
    \$\$;

    -- Create the application database if it doesn't exist
    SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\\gexec

    -- Grant all privileges
    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

echo "Database initialization completed!"