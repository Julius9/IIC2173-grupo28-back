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
    mail VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    money DECIMAL(10, 2) NOT NULL DEFAULT 5000.00
    admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE,
    user_id INT,
    amount NUMERIC NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    flight_id INT NOT NULL,
    request_id VARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

CREATE TABLE internal_auction (
    id SERIAL PRIMARY KEY,
    auction_id VARCHAR(255) UNIQUE,
    proposal_id VARCHAR(255),
    departure_airport VARCHAR(255),
    arrival_airport VARCHAR(255),
    departure_time TIMESTAMP,
    airline VARCHAR(255),
    quantity INT,
    group_id INT,
    type VARCHAR(255)
);

CREATE TABLE external_auction (
    id SERIAL PRIMARY KEY,
    auction_id VARCHAR(255) UNIQUE,
    proposal_id VARCHAR(255),
    departure_airport VARCHAR(255),
    arrival_airport VARCHAR(255),
    departure_time TIMESTAMP,
    airline VARCHAR(255),
    quantity INT,
    group_id INT,
    type VARCHAR(255)
);
CREATE TABLE internal_proposal (
    id SERIAL PRIMARY KEY,
    auction_id VARCHAR(255),
    proposal_id VARCHAR(255) UNIQUE,
    departure_airport VARCHAR(255),
    arrival_airport VARCHAR(255),
    departure_time TIMESTAMP,
    airline VARCHAR(255),
    quantity INT,
    group_id INT,
    type VARCHAR(255),
    expired BOOLEAN
);

CREATE TABLE external_proposal (
    id SERIAL PRIMARY KEY,
    auction_id VARCHAR(255),
    proposal_id VARCHAR(255) UNIQUE,
    departure_airport VARCHAR(255),
    arrival_airport VARCHAR(255),
    departure_time TIMESTAMP,
    airline VARCHAR(255),
    quantity INT,
    group_id INT,
    type VARCHAR(255)
);

CREATE UNIQUE INDEX "Transaction_token_key" ON "transaction"("token");
