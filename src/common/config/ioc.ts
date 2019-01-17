import { Container } from 'inversify';
import constants from './constants';

import QueueService, { IQueueService } from '../services/queue';

import RedisService, { IRedisService } from '../services/redis';

import { UserRepository, UserRepo } from '@app/data/repositories/user';
import {
  VerificationRepository,
  VerificationRepo,
} from '@app/data/repositories/verification';

// import controllers
import '../../server/controllers';

const container = new Container();

// bind services
container
  .bind<IQueueService>(constants.QueueService)
  .to(QueueService)
  .inSingletonScope();
container
  .bind<IRedisService>(constants.RedisService)
  .to(RedisService)
  .inSingletonScope();

// bind repositories
container.bind<UserRepo>(constants.UserRepo).to(UserRepository);
container
  .bind<VerificationRepo>(constants.VerificationRepo)
  .to(VerificationRepository);

export default container;
