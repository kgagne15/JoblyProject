"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/*
*Used solution
*
*This function checks that the user has authentic JWT and is part of res.locals.user
*It also checks that the user has an isAdmin field flagged.
*If not it will throw an unauthorized error
*/
function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
      return next();
  } catch(e) {
    return next(e);
  }
}

/*
*Used solution
*
*This function checks that the user has authentic JWT and is part of res.locals.user
*It also checks that the user has an isAdmin field flagged OR their username matches the username of the user to be edited/deleted.
*If not it will throw an unauthorized error
*/
function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user
    if (!(user && user.isAdmin || user.username === req.params.username)) {
      throw new UnauthorizedError();
    }
    return next();
  } catch(e) {
    return next();
  }
}


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin
};
