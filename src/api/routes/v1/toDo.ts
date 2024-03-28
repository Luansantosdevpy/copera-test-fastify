import { FastifyInstance } from 'fastify';
import ToDoController from '../../controllers/toDoController';
import { container } from 'tsyringe';
import * as validations from '../../../application/validations/toDoSchema';

export default async (fastify: FastifyInstance): Promise<void> => {
  const toDoController = container.resolve(ToDoController);

  fastify.post('/create', { schema: validations.createSchema }, toDoController.create);
  fastify.post('/complete-in-batch', { schema: validations.completeInBatchSchema }, toDoController.completeInBatch);
  fastify.delete('/delete-in-batch', { schema: validations.deleteInBatchSchema }, toDoController.deleteInBatch);
  fastify.get('/todo', toDoController.findAll);
  fastify.get('/todo/get-count-todo', toDoController.getTodoCount);
  fastify.get('/todo/:id', toDoController.findById);
  fastify.put('/todo/update-description/:id', { schema: validations.updateDescriptionSchema }, toDoController.updateDescription);
  fastify.put('/todo/update-status/:id', { schema: validations.updateStatusSchema }, toDoController.updateStatus);
  fastify.delete('/todo/:id', { schema: validations.deleteTaskSchema }, toDoController.delete);
};
