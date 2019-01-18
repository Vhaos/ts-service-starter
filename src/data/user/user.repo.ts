import { Document } from 'mongoose';
import { injectable } from 'inversify';
import { BaseRepository } from '../base/base.repo';
import { User, LoginDTO } from './user.model';
import UserSchema from './user.schema';
import { Repository } from '../contracts/repo.contract';

@injectable()
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('User', UserSchema);
  }

  populateUser(document: Document): Promise<Document> {
    return document.populate('user_account').execPopulate();
  }

  login(credentials: LoginDTO): Promise<User> {
    // not the most elegant implementation, consider chaining
    // the promises
    return new Promise<User>((resolve, reject) => {
      this.byQuery({ email: credentials.email }, '+password')
        .then(user => {
          return user
            .isValidPassword(credentials.password)
            .then(isValid => resolve(user));
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}

/**
 * User Repository Interface
 */
export interface UserRepo extends Repository<User> {
  login(credentials: LoginDTO): Promise<User>;
  populateUser(document: Document): Promise<Document>;
}
