import mongoose, { Document, Model, Schema } from 'mongoose';
import { injectable, unmanaged } from 'inversify';
import { DuplicateModelError, ModelNotFoundError } from './utils/errors';
import { Repository, Query, QueryResult } from './utils/contract';

@injectable()
export class BaseRepository<T extends Document> implements Repository<T> {
  model: Model<T>;
  constructor(@unmanaged() private name: string, @unmanaged() schema: Schema) {
    this.model = mongoose.model<T>(name, schema);
  }

  /**
   * checks if the archived argument is either undefined
   * or passed as a false string in the cause of query params, and
   * converts it to a boolean.
   * @param archived string or boolean archived option
   */
  convertArchived = archived =>
    archived === undefined || archived === 'false' ? false : true;

  /**
   * Converts a passed condition argument to a query
   * @param condition string or object condition
   */
  getQuery = (condition: string | object) => {
    return typeof condition === 'string'
      ? { _id: condition }
      : { ...condition };
  };

  create(attributes: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.model.create(attributes, (err, result) => {
        if (err && err.code === 11000)
          return reject(new DuplicateModelError(`${this.name} exists already`));
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  byID(_id: string, projections?: any, archived?: boolean): Promise<T> {
    return new Promise((resolve, reject) => {
      archived = this.convertArchived(archived);
      this.model
        .findOne({
          _id,
          ...(!archived
            ? { deleted_at: undefined }
            : { deleted_at: { $ne: undefined } }),
        })
        .select(projections)
        .exec((err, result) => {
          if (err) return reject(err);
          if (!result)
            return reject(new ModelNotFoundError(`${this.name} not found`));
          resolve(result);
        });
    });
  }

  byQuery(
    query: any,
    projections?: any,
    archived?: boolean | string,
  ): Promise<T> {
    archived = this.convertArchived(archived);
    return new Promise((resolve, reject) => {
      this.model
        .findOne({
          ...query,
          ...(!archived
            ? { deleted_at: undefined }
            : { deleted_at: { $ne: undefined } }),
        })
        .select(projections)
        .exec((err, result) => {
          if (err) return reject(err);
          if (!result)
            return reject(new ModelNotFoundError(`${this.name} not found`));
          resolve(result);
        });
    });
  }

  all(query: Query): Promise<QueryResult<T>> {
    return new Promise((resolve, reject) => {
      const page = Number(query.page) - 1 || 0;
      const per_page = Number(query.per_page) || 20;
      const offset = page * per_page;
      const sort = query.sort || 'created_at';
      const archived = this.convertArchived(query.archived);
      this.model
        .find({
          ...query.conditions,
          ...(!archived
            ? { deleted_at: undefined }
            : { deleted_at: { $ne: undefined } }),
        })
        .limit(per_page)
        .select(query.projections)
        .skip(offset)
        .sort(sort)
        .exec((err, result) => {
          if (err) return reject(err);
          const queryResult = {
            page: page + 1,
            per_page,
            sort,
            result,
          };
          resolve(queryResult);
        });
    });
  }

  update(condition: string | object, update: any): Promise<T> {
    const query = this.getQuery(condition);

    return new Promise((resolve, reject) => {
      this.model.findOne(query, (err, result) => {
        if (err) return reject(err);
        if (!result)
          return reject(new ModelNotFoundError(`${this.name} not found`));
        result.set(update);
        result.save((err, updatedDocument) => {
          if (err) return reject(err);
          resolve(updatedDocument);
        });
      });
    });
  }

  /**
   * Allows the user of atomic operators such as $inc in updates.
   * Note: It does not trigger mongoose `save` hooks.
   * @param condition Query condition to match against documents
   * @param update The document update
   */
  updateWithOperators(condition: string | object, update: any): Promise<T> {
    const query = this.getQuery(condition);

    return new Promise((resolve, reject) => {
      this.model.findOneAndUpdate(
        query,
        update,
        { new: true },
        (err, result) => {
          if (err) return reject(err);
          if (!result)
            return reject(new ModelNotFoundError(`${this.name} not found`));
          resolve(result);
        },
      );
    });
  }

  /**
   * Soft deletes a document
   * @param condition
   */
  remove(condition: string | object): Promise<T> {
    return new Promise((resolve, reject) => {
      const query = this.getQuery(condition);

      this.model.findOneAndUpdate(
        query,
        {
          deleted_at: new Date(),
        },
        {
          new: true,
        },
        (err, result) => {
          if (err) return reject(err);
          if (!result)
            return reject(new ModelNotFoundError(`${this.name} not found`));
          resolve(result);
        },
      );
    });
  }

  /**
   * Permanently deletes a document
   * @param condition
   */
  destroy(condition: string | object): Promise<T> {
    return new Promise((resolve, reject) => {
      const query = this.getQuery(condition);

      this.model.findOneAndDelete(query, (err, result) => {
        if (err) return reject(err);
        if (!result)
          return reject(new ModelNotFoundError(`${this.name} not found`));
        resolve(result);
      });
    });
  }
}
