import ToDoController from '../../controllers/toDoController';
import { container } from 'tsyringe';
import * as validations from '../../../application/validations/toDoSchema';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async (fastify: FastifyInstance, io: any): Promise<void> => {
  const toDoController = container.resolve(ToDoController);

  fastify.post('/task/create', { schema: validations.createSchema }, (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.create(request, reply, fastify.io);
  });

  fastify.post('/task/complete-in-batch', { schema: validations.completeInBatchSchema }, (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.completeInBatch(request, reply, fastify.io);
  });

  fastify.delete('/task/delete-in-batch', { schema: validations.deleteInBatchSchema }, (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.deleteInBatch(request, reply, fastify.io);
  });

  fastify.get('/tasks', (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.findAll(request, reply);
  });

  fastify.get('/task/get-count-todo', (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.getTodoCount(request, reply);
  });

  fastify.get('/task/:id', (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.findById(request, reply);
  });

  fastify.put('/task/update-description/:id', { schema: validations.updateDescriptionSchema }, (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.updateDescription(request, reply, fastify.io);
  });

  fastify.put('/task/update-status/:id', { schema: validations.updateStatusSchema }, (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.updateStatus(request, reply, fastify.io);
  });

  fastify.delete('/task/:id', { schema: validations.deleteTaskSchema }, (request: FastifyRequest, reply: FastifyReply) => {
    toDoController.delete(request, reply, fastify.io);
  });
};