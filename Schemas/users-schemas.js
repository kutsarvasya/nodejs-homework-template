import Joi from "joi";

const userSignupSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string()
    .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .required(),
  subscription: Joi.string().default("starter"),
});
const emailSchema = Joi.object({
  email: Joi.string()
    .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .required(),
});

const userSignInSchema = Joi.object({
  email: Joi.string()
    .pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    .required(),
  password: Joi.string().min(6).required(),
});

export default {
  userSignupSchema,
  userSignInSchema,
  emailSchema,
};
