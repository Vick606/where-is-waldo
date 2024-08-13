const Joi = require('joi');

const validations = {
  startNewGame: Joi.object({
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required()
  }),

  validateCharacter: Joi.object({
    character: Joi.string().required(),
    x: Joi.number().required(),
    y: Joi.number().required()
  }),

  submitScore: Joi.object({
    playerName: Joi.string().required(),
    timeTaken: Joi.number().required(),
    hintsUsed: Joi.number().integer().min(0).required()
  }),

  getHint: Joi.object({
    character: Joi.string().required()
  }),

  selectImage: Joi.object({
    imageId: Joi.string().required()
  })
};

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
}

module.exports = {
  validate,
  schemas: validations
};