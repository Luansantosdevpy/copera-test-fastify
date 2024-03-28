import { FastifySchema } from 'fastify';

const createSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      body: { type: 'string' }
    },
    required: ['body']
  }
};

const updateDescriptionSchema: FastifySchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      properties: {
        body: { type: 'string' }
      },
      required: ['body']
    }
  };

  const updateStatusSchema: FastifySchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      properties: {
        completed: { type: 'boolean' }
      },
      required: ['completed']
    }
  };

  const deleteInBatchSchema: FastifySchema = {
    body: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } }
      },
      required: ['ids']
    }
  };
  
  const deleteTaskSchema: FastifySchema = {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    }
  };

  const completeInBatchSchema: FastifySchema = {
    body: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
        completed: { type: 'boolean' }
      },
      required: ['ids', 'completed']
    }
  };

export {
    createSchema,
    updateDescriptionSchema,
    updateStatusSchema,
    deleteInBatchSchema,
    completeInBatchSchema,
    deleteTaskSchema
};