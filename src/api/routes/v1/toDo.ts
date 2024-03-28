import ToDoController from '../../controllers/toDoController';
import { container } from 'tsyringe';
import * as validations from '../../../application/validations/toDoSchema';
import CustomFastifyInstance from '../../../domain/interfaces/infrastructure/ioInterface';

export default async (fastify: CustomFastifyInstance): Promise<void> => {
  const toDoController = container.resolve(ToDoController);

  if (fastify.io) {
    toDoController.setSocketInstance(fastify.io);
  } else {
    console.error('Server socket instance is not available');
  }

  fastify.post('/task/create', { schema: validations.createSchema }, toDoController.create);
  fastify.post('/task/complete-in-batch', { schema: validations.completeInBatchSchema }, toDoController.completeInBatch);
  fastify.delete('/task/delete-in-batch', { schema: validations.deleteInBatchSchema }, toDoController.deleteInBatch);
  fastify.get('/tasks', toDoController.findAll);
  fastify.get('/task/get-count-todo', toDoController.getTodoCount);
  fastify.get('/task/:id', toDoController.findById);
  fastify.put('/task/update-description/:id', { schema: validations.updateDescriptionSchema }, toDoController.updateDescription);
  fastify.put('/task/update-status/:id', { schema: validations.updateStatusSchema }, toDoController.updateStatus);
  fastify.delete('/task/:id', { schema: validations.deleteTaskSchema }, toDoController.delete);
};
