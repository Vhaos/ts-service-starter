import { Model } from '../base/base.model';

export interface Verification extends Model {
  user_id: string;
  token: string;
}
