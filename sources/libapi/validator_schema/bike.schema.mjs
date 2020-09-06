export default {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minimum: 1,
    },
  },
  required: ['id'],
};
