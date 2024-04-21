CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    departure_airport_name VARCHAR(255),
    departure_airport_id VARCHAR(255),
    departure_airport_time TIMESTAMP,
    arrival_airport_name VARCHAR(255),
    arrival_airport_id VARCHAR(255),
    arrival_airport_time TIMESTAMP,
    duration NUMERIC,
    airplane VARCHAR(255),
    airline VARCHAR(255),
    airline_logo VARCHAR(255),
    carbon_emissions NUMERIC,
    price NUMERIC,
    currency VARCHAR(10),
    airlinelogo VARCHAR(255),
    tickets_left INT DEFAULT 90
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    flight_id INT,
    user_id INT,
    quantity INT,
    total_price NUMERIC,
    purchase_date TIMESTAMP,
    location VARCHAR(255),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    money DECIMAL(10, 2) NOT NULL DEFAULT 5000.00
);
