import uuidv4 from "uuid/v4";
import { trimmedString } from "../utils/schema.utils";
import { SchemaFactory } from "../base/base.schema";

const VerificationSchema = SchemaFactory({
  user_id: { ...trimmedString, required: true },
  token: { ...trimmedString, default: uuidv4 }
});

export default VerificationSchema;
