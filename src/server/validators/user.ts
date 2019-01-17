import joi from 'joi';

export const login = joi.object({
  email: joi
    .string()
    .email()
    .trim()
    .lowercase()
    .required(),
  password: joi
    .string()
    .trim()
    .required(),
});

export const resetPassword = joi.object({
  email: joi
    .string()
    .email()
    .trim()
    .lowercase()
    .required(),
});

export const changePassword = joi.object({
  email: joi
    .string()
    .email()
    .trim()
    .lowercase()
    .required(),
  password: joi
    .string()
    .trim()
    .required(),
  token: joi.string().required(),
});
