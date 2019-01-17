import { Schema, SchemaTypes } from 'mongoose';
import {
  uuid,
  trimmedLowercaseString,
  trimmedString,
  readMapper,
  timestamps,
  hashPassword,
  isValidPassword,
} from './utils';

const UserSchema = new Schema(
  {
    _id: { ...uuid },
    deleted_at: { type: SchemaTypes.Date },
    email: { ...trimmedLowercaseString, unique: true, required: true },
    is_verified: { type: SchemaTypes.Boolean, default: false },
    password: { ...trimmedString, required: true, select: false },
    phone_number: { ...trimmedString, unique: true, required: true },
  },
  {
    ...readMapper,
    ...timestamps,
    // @ts-ignore
    selectPopulatedPaths: false,
  },
)
  .pre('save', hashPassword)
  .method('isValidPassword', isValidPassword);

export default UserSchema;
