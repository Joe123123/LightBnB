const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb"
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const values = [email];
  const text = "SELECT * FROM users WHERE email = $1;";
  return pool
    .query(text, values)
    .then(data => (data.rows[0] ? data.rows[0] : null));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const values = [id];
  const text = "SELECT * FROM users WHERE id = $1;";
  return pool
    .query(text, values)
    .then(data => (data.rows[0] ? data.rows[0] : null));
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const { name, password, email } = user;
  const values = [name, password, email];
  const text =
    "INSERT INTO users(name, password, email) VALUES ($1, $2, $3) RETURNING *;";
  return pool
    .query(text, values)
    .then(data => (data.rows[0] ? data.rows[0] : null));
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const values = [guest_id, limit];
  const text = `SELECT
                  r.*,
                  p.*,
                  AVG(rating) average_rating
                FROM reservations r
                JOIN properties p ON p.id = r.property_id
                JOIN property_reviews pr ON p.id = pr.property_id
                WHERE
                  r.guest_id = $1
                GROUP BY
                  p.id,
                  r.id
                ORDER BY
                  r.start_date
                LIMIT
                  $2;`;
  return pool.query(text, values).then(data => data.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**  average_rating
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const text = `SELECT p.*, AVG(pr.rating) average_rating 
                FROM properties p JOIN property_reviews pr ON p.id = pr.property_id
                GROUP BY pr.id, p.id
                LIMIT $1;`;
  const values = [limit];
  return pool.query(text, values).then(data => data.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
