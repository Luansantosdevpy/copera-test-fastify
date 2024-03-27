import { FastifyInstance } from 'fastify';
import ToDoController from '../../controllers/toDoController';
import { container } from 'tsyringe';

export default async (fastify: FastifyInstance): Promise<void> => {
  const toDoController = container.resolve(ToDoController);

  fastify.post('/api/create', toDoController.create);
  fastify.post('/api/complete-in-batch', toDoController.completeInBatch);
  fastify.delete('/api/delete-in-batch', toDoController.deleteInBatch);
  fastify.get('/api/todo', toDoController.findAll);
  fastify.get('/api/todo/get-count-todo', toDoController.getTodoCount);
  fastify.get('/api/todo/:id', toDoController.findById);
  fastify.put('/api/todo/update-description/:id', toDoController.updateDescription);
  fastify.put('/api/todo/update-status/:id', toDoController.updateStatus);
  fastify.delete('/api/todo/:id', toDoController.delete);
};
