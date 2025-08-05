#!/bin/bash
set -e

# Create the application user and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the application user if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'skillswapuser') THEN
            CREATE USER skillswapuser WITH PASSWORD 'skillswapuserpassword';
        END IF;
    END
    \$\$;

    -- Create the application database if it doesn't exist
    SELECT 'CREATE DATABASE skillswap OWNER skillswapuser'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'skillswap')\\gexec

    -- Grant all privileges
    GRANT ALL PRIVILEGES ON DATABASE skillswap TO skillswapuser;
EOSQL

echo "Database initialization completed!"