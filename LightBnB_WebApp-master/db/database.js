const properties = require("../server/json/properties.json");
const users = require("../server/json/users.json");
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

/// Properties

/**  average_rating
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const {
    // use getPropertiesById;
    // owner_id,
    city,
    minimum_price_per_night,
    maximum_price_per_night,
    minimum_rating
  } = options;
  let values = [];
  let text = `SELECT p.*, AVG(pr.rating) average_rating 
              FROM properties p JOIN property_reviews pr ON p.id = pr.property_id
             `;
  if (city) {
    values.push(`%${options.city}%`);
    text += `WHERE city LIKE $${values.length} `;
  }
  // use getPropertiesById;

  // if (owner_id) {
  //   values.push(parseInt(owner_id));
  //   if (text.includes("WHERE")) {
  //     text += `AND p.owner_id = $${values.length} `;
  //   } else {
  //     text += `WHERE p.owner_id = $${values.length} `;
  //   }
  // }
  if (minimum_price_per_night) {
    values.push(parseFloat(minimum_price_per_night) * 100);
    text += `AND p.cost_per_night >= $${values.length} `;
    // still work without where??? wired???

    // if (text.includes("WHERE")) {
    //   text += `AND p.cost_per_night >= $${values.length} `;
    // } else {
    //   text += `WHERE p.cost_per_night >= $${values.length} `;
    // }
  }
  if (maximum_price_per_night) {
    values.push(parseFloat(maximum_price_per_night) * 100);
    text += `AND p.cost_per_night <= $${values.length} `;
  }
  text += `GROUP BY pr.id, p.id `;
  if (minimum_rating) {
    values.push(parseFloat(minimum_rating));
    text += `HAVING AVG(pr.rating) >= $${values.length} `;
  }
  values.push(limit);
  text += `LIMIT $${values.length};`;
  return pool.query(text, values).then(data => data.rows);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  } = property;
  const values = [
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night * 100,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
  ];
  const text = `INSERT INTO properties (
                  owner_id,
                  title,
                  description,
                  thumbnail_photo_url,
                  cover_photo_url,
                  cost_per_night,
                  street,
                  city,
                  province,
                  post_code,
                  country,
                  parking_spaces,
                  number_of_bathrooms,
                  number_of_bedrooms
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *;
                `;
  return pool.query(text, values).then(data => data.rows);
};

// add my own
const getPropertiesById = function(id, limit = 10) {
  const values = [id, limit];
  const text = `SELECT
                  p.*,
                  AVG(pr.rating) average_rating
                FROM properties p
                LEFT JOIN property_reviews pr ON p.id = pr.property_id
                WHERE
                  p.owner_id = $1
                GROUP BY
                  p.id
                ORDER BY
                p.id DESC
                LIMIT
                  $2;`;
  return pool.query(text, values).then(data => data.rows);
};

module.exports = {
  addProperty,
  getAllProperties,
  getAllReservations,
  addUser,
  getUserWithId,
  getUserWithEmail,
  getPropertiesById
};
