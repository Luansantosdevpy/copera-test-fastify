import { FastifyInstance } from 'fastify';
import ToDoController from '../../controllers/toDoController';
import { container } from 'tsyringe';

export default async (fastify: FastifyInstance): Promise<void> => {
  const toDoController = container.resolve(ToDoController);

  fastify.post('/create', toDoController.create);
  fastify.post('/complete-in-batch', toDoController.completeInBatch);
  fastify.delete('/delete-in-batch', toDoController.deleteInBatch);
  fastify.get('/todo', toDoController.findAll);
  fastify.get('/todo/get-count-todo', toDoController.getTodoCount);
  fastify.get('/todo/:id', toDoController.findById);
  fastify.put('/todo/update-description/:id', toDoController.updateDescription);
  fastify.put('/todo/update-status/:id', toDoController.updateStatus);
  fastify.delete('/todo/:id', toDoController.delete);
};
