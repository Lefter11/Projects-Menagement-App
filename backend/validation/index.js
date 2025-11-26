const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const userSchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
};

const projectSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 2 },
    description: { type: 'string' },
  },
  additionalProperties: false,
};

const taskSchema = {
  type: 'object',
  required: ['title', 'project_id'],
  properties: {
    title: { type: 'string', minLength: 2 },
    description: { type: 'string' },
    status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
    project_id: { type: 'integer' },
  },
  additionalProperties: false,
};

const validateUser = ajv.compile(userSchema);
const validateProject = ajv.compile(projectSchema);
const validateTask = ajv.compile(taskSchema);

const validate = (validator) => (req, res, next) => {
  const data = req.body;
  console.log('🧩 BODY FOR VALIDATION:', data, 'TYPE:', typeof data);

  const valid = validator(data);
  if (!valid) {
    return res.status(400).json({ errors: validator.errors });
  }
  next();
};

module.exports = {
  validateUser: validate(validateUser),
  validateProject: validate(validateProject),
  validateTask: validate(validateTask),
};
