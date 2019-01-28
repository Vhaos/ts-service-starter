import { injectable } from 'inversify';
import { Response } from 'express';
import HttpStatus from 'http-status-codes';
import _ from 'lodash';

import { Query } from '@app/data/contracts/repo.contract';
import {
  DuplicateModelError,
  ModelNotFoundError,
} from '@app/data/errors/repo.errors';

type PaginationOptions = Pick<
  Query,
  Exclude<keyof Query, 'conditions' | 'archived'>
>;

@injectable()
export default class BaseController {
  getHTTPCode(err) {
    if (err instanceof ModelNotFoundError) return HttpStatus.NOT_FOUND;
    if (err instanceof DuplicateModelError) return HttpStatus.BAD_REQUEST;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  handleSuccess(res: Response, data: any) {
    //log res
    res.jSend.success(data);
  }

  handleError(res: Response, err: Error) {
    //log response and error
    res.jSend.error(null, err.message, this.getHTTPCode(err));
  }

  getPaginationOptions(query: any): PaginationOptions {
    return _.pick(query, ['paginate', 'page', 'per_page', 'projections', 'sort']);
  }
}
