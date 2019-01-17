import { Response } from 'express';
import { inject } from 'inversify';
import crypto from 'crypto';
import { promisify } from 'util';
import {
  controller,
  httpPost,
  requestBody,
  response,
  httpGet,
  queryParam,
} from 'inversify-express-utils';

import constants from '@app/common/config/constants';

import { IRedisService } from '@app/common/services/redis';
import { IQueueService } from '@app/common/services/queue';

import {
  LoginDTO,
  ResetPasswordDTO,
  //ChangePasswordDTO,
} from '@app/data/models/user';
import { UserRepo } from '@app/data/repositories/user';
import { VerificationRepo } from '@app/data/repositories/verification';

import BaseController from './base';
import * as JWT from '../utils/auth';
import { login, resetPassword /* changePassword */ } from '../validators/user';
import Validator from '../middlewares/validator';

const genRandomBytes = promisify(crypto.randomBytes);

@controller('/user')
export default class UserController extends BaseController {
  @inject(constants.UserRepo)
  private userRepo: UserRepo;
  @inject(constants.VerificationRepo)
  private verificationRepo: VerificationRepo;
  @inject(constants.RedisService)
  private redisService: IRedisService;
  @inject(constants.QueueService)
  private queueService: IQueueService;

  @httpPost('/login', Validator(login))
  async login(@response() res: Response, @requestBody() body: LoginDTO) {
    try {
      const user = await this.userRepo.byQuery(
        {
          email: body.email,
        },
        '+password',
      );
      await user.isValidPassword(body.password);
      const token = await JWT.sign(user.toJSON());
      this.handleSuccess(res, { token });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * Creates a password reset token and sends it to
   * a user's email.
   * @param res Express response object
   * @param body Express request body
   */
  @httpPost('/reset-password', Validator(resetPassword))
  async resetPassword(
    @response() res: Response,
    @requestBody() body: ResetPasswordDTO,
  ) {
    try {
      const user = await this.userRepo.byQuery({ email: body.email });

      const tokenExists = await this.redisService.get(
        `reset-password:${user.email}`,
      );
      if (tokenExists)
        throw new Error(
          'Password reset link already exists. Please check your email',
        );

      const token = (await genRandomBytes(20)).toString('hex');

      // save the reset-token to redis for 5 hours.
      await this.redisService.set(
        `reset-password:${user.email}`,
        token,
        'EXP',
        18000,
      );

      this.handleSuccess(res, { email: user.email });
      this.queueService.sendEmail({
        to: user.email,
        subject: 'Password reset',
        html: `Click on this link to reset your password: <a href="/user/reset-password?token=${token}&email=${
          user.email
        }"> Here</a>`,
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  /**
   * Actually changes a user's passsword.
   * @param res Express response object
   * @param body Express request body
   */
  // @httpPost('/change-password', Validator(changePassword))
  // async changePassword(
  //   @response() res: Response,
  //   @requestBody() body: ChangePasswordDTO,
  // ) {
  //   try {
  //     const token = await this.redisService.get(`reset-password:${body.email}`);

  //     if (!token || token !== body.token) throw new Error('Invalid operation');

  //     await this.userRepo.changePassword(body.password);

  //     this.handleSuccess(res, null);
  //   } catch (err) {
  //     this.handleError(res, err);
  //   }
  // }

  @httpGet('/verification')
  async get(
    @response() res: Response,
    @queryParam('email') email: string,
    @queryParam('token') token: string,
  ) {
    try {
      if (!email || !token) throw new Error('Invalid verification URL');

      const user = await this.userRepo.byQuery({ email });
      if (user.is_verified) throw new Error('User is already verified');

      const foundToken = await this.verificationRepo.byQuery({ token });
      user.is_verified = true;
      await user.save();

      // delete the token
      await await foundToken.remove();

      this.handleSuccess(res, { message: 'Successfully verified user' });
    } catch (err) {
      this.handleError(res, err);
    }
  }
}
