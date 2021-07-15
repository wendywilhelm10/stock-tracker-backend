-- DROP DATABASE IF EXISTS stock_tracker;
-- CREATE DATABASE stock_tracker;

-- \c stock_tracker
-- DROP TABLE IF EXISTS users;
CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE user_stocks
(
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    ticker VARCHAR(6) NOT NULL,
    PRIMARY KEY (user_id, ticker)
);

CREATE TABLE user_stocks_own
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    ticker VARCHAR(6) NOT NULL,
    date_bought DATE NOT NULL,
    price NUMERIC (8, 2) NOT NULL,
    qty INTEGER NOT NULL
);

CREATE TABLE indices
(
    id SERIAL PRIMARY KEY,
    index_ticker VARCHAR(7),
    indexName TEXT NOT NULL
);

CREATE TABLE user_indices
(
    user_id INTEGER REFERENCES users ON DELETE CASCADE,
    index_id INTEGER REFERENCES indices ON DELETE CASCADE,
    PRIMARY KEY (user_id, index_id)
);

INSERT INTO indices
VALUES (1, 'DJI', 'Dow Jones'),
       (2, 'IXIC', 'NASDAQ'),
       (3, 'GSPC', 'S&P 500'),
       (4, 'MID', 'S&P 400 MID CAP Index'),
       (5, 'NDX', 'NASDAQ 100 Index'),
       (6, 'XAX', 'NYSE AMEX Composite Index'),
       (7, 'DJT', 'Dow Jones Transportation Average'),
       (8, 'NYA', 'NYSE Composite Index');
       (9, 'RUT', 'Russell 2000 Index');