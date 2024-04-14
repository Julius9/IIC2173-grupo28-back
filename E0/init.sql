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
    airlinelogo VARCHAR(255)
);
