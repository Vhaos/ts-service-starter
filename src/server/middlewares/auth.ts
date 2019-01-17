import httpStatus from 'http-status-codes';
import * as JWT from '../utils/auth';
import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware that checks if an authorization header with
 * a JWT token exists in the request. If one exists it decodes
 *  it and populates `req.user` with the decoded value.
 */
const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization)
      throw new Error('Missing authorization header in request.');
    const token = req.headers.authorization.split(' ')[1];
    req.user = await JWT.decode(token);
    next();
  } catch (err) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      status: 'error',
      data: null,
      message: err.message,
      code: httpStatus.UNAUTHORIZED,
    });
  }
};

export default Auth;
