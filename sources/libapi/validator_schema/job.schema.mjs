export default {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minimum: 1,
    },
    bike: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minimum: 1,
        },
      },
      required: ['id'],
    },
    officer: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          minimum: 1,
        },
      },
      required: ['id'],
    },
  },
  required: ['id', 'bike', 'officer'],
};
