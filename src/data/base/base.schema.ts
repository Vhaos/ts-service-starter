import { SchemaDefinition, SchemaOptions, Schema, SchemaTypes } from "mongoose";

import { uuid, readMapper, timestamps } from "../utils/schema.utils";

export const SchemaFactory = (
  schemaFields: SchemaDefinition,
  options?: SchemaOptions
) => {
  if (!schemaFields || Object.keys(schemaFields).length === 0) {
    throw new Error("Please specify schemaFields");
  }

  return new Schema(
    {
      ...schemaFields,
      deleted_at: { type: SchemaTypes.Date },
      _id: { ...uuid }
    },
    {
      ...options,
      ...readMapper,
      ...timestamps,
      // @ts-ignore
      selectPopulatedPaths: false
    }
  );
};
