const mongoose = require('mongoose');

// Converts a string/ObjectId into an ObjectId (needed inside aggregation pipelines)
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

// Escapes user input before using it inside a RegExp (safe search)
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Rounds money values to 2 decimal places
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Copies only the allowed keys from an object (prevents mass-assignment, e.g. changing `user`)
const pick = (source, keys) =>
  keys.reduce((result, key) => {
    if (source[key] !== undefined) result[key] = source[key];
    return result;
  }, {});

module.exports = { toObjectId, isValidObjectId, escapeRegex, round2, pick };
