-- Remove any existing database and user.
DROP DATABASE IF EXISTS expenses;
DROP USER IF EXISTS expenses_user@localhost;

-- Create Expenses database and user. Ensure Unicode is fully supported.
CREATE DATABASE expenses CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER expenses_user@localhost IDENTIFIED WITH mysql_native_password BY 'REDACT';
GRANT ALL PRIVILEGES ON expenses.* TO expenses_user@localhost;

-- sudo service mysql start
-- sudo mysql < create_expenses.sql
-- mysql --user expenses_user --password expenses