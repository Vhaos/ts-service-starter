import { SchemaTypes } from "mongoose";
import {
  trimmedLowercaseString,
  trimmedString,
  readMapper,
  timestamps,
  hashPassword,
  isValidPassword
} from "../utils/schema.utils";
import { SchemaFactory } from "../base/base.schema";

const UserSchema = SchemaFactory({
  email: { ...trimmedLowercaseString, unique: true, required: true },
  is_verified: { type: SchemaTypes.Boolean, default: false },
  password: { ...trimmedString, required: true, select: false },
  phone_number: { ...trimmedString, unique: true, required: true }
})
  .pre("save", hashPassword)
  .method("isValidPassword", isValidPassword);

export default UserSchema;
