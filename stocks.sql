\echo 'Delete and recreate stock_tracker_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE stock_tracker_test;
CREATE DATABASE stock_tracker_test;
\connect stock_tracker_test

\i stocks-schema.sql