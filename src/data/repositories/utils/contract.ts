export interface QueryResult<T> {
  page: number;
  per_page: number;
  sort: string | object;
  result: T[];
}

export interface Query {
  archived?: boolean | string;
  conditions: any;
  page?: number;
  per_page?: number;
  projections?: any;
  sort?: string | object;
}

export interface Repository<T> {
  create(attributes: any): Promise<T>;
  byID(id: string, projections?: any, archived?: boolean): Promise<T>;
  byQuery(query: any, projections?: any, archived?: boolean): Promise<T>;
  all(query: Query): Promise<QueryResult<T>>;
  update(condition: string | object, update: any): Promise<T>;
  updateWithOperators(condition: string | object, update: any): Promise<T>;
  remove(condition: string | object): Promise<T>;
  destroy(condition: string | object): Promise<T>;
}
