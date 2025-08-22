#!/bin/bash
set -e

# Create the application user and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the application user if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_TEST_USER') THEN
            CREATE USER $DB_TEST_USER WITH PASSWORD '$DB_TEST_PASSWORD';
        END IF;
    END
    \$\$;

    -- Create the application database if it doesn't exist
    SELECT 'CREATE DATABASE $DB_TEST_NAME OWNER $DB_TEST_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_TEST_NAME')\\gexec

    -- Grant all privileges
    GRANT ALL PRIVILEGES ON DATABASE $DB_TEST_NAME TO $DB_TEST_USER;
EOSQL

echo "Test database initialization completed!"