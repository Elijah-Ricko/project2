DROP TABLE IF EXISTS expenses;

-- Amount of money spent (negative) or deposited (positive), date of occurrence, brief description.
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(13,2),
  year INT,
  month INT,
  day INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
