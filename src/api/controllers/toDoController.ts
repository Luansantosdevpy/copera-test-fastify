import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpStatusCode } from 'axios';
import Logger from '../../infrastructure/log/logger';
import ValidationError from '../../application/exceptions/validationError';
import NotFoundError from '../../application/exceptions/notFoundError';
import ToDoInterface from '../../domain/interfaces/models/toDoInterface';
import ToDoService from '../../application/services/toDoService';
import { inject, injectable } from 'tsyringe';
import UnprocessableEntityError from '../../application/exceptions/UnprocessableEntityError';
import { Server } from 'socket.io';
import ErrorHandler from '../handlers/errorHandler';

@injectable()
export default class ToDoController {
  constructor(
    @inject(ToDoService)
    public readonly toDoService: ToDoService
  ) {}

  public findAll = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const page: number = parseInt(request.query as string, 10) || 1;
      const limit: number = parseInt(request.query as string, 10) || 10;

      Logger.debug(
        `ToDoController - findAll - call toDoService.findAll with page: ${page} and limit: ${limit}`
      );

      const toDos: ToDoInterface[] | null = await this.toDoService.findAll(
        page,
        limit
      );

      reply.code(HttpStatusCode.Ok).send({ data: toDos });
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public create = async (
    request: FastifyRequest,
    reply: FastifyReply,
    io: Server
  ): Promise<void> => {
    try {
      Logger.debug('ToDoController - create - call toDoService.create');
      const toDo = await this.toDoService.create(request.body!);

      if (io) {
        Logger.info('Enviando evento');
        io.emit('task_created', toDo);
        Logger.info('Evento enviado com sucesso!');
      }

      reply.code(HttpStatusCode.Created).send({ data: toDo });
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public findById = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params as { id: string };

      Logger.debug('ToDoController - find - call toDoService.find');
      const toDo = await this.toDoService.findById(id);

      reply.code(HttpStatusCode.Ok).send({ data: toDo });
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public updateDescription = async (
    request: FastifyRequest,
    reply: FastifyReply,
    io: Server
  ): Promise<void> => {
    try {
      const { id } = request.params as { id: string };
      const { body } = request.body as { body: string };

      Logger.debug('ToDoController - update - call toDoService.update');
      await this.toDoService.updateDescription(id, body);

      io.emit('update_task_description', { id, body: body });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public updateStatus = async (
    request: FastifyRequest,
    reply: FastifyReply,
    io: Server
  ): Promise<void> => {
    try {
      const { id } = request.params as { id: string };
      const { completed } = request.body as { completed: boolean };

      Logger.debug(
        'ToDoController - updateStatus - call toDoService.updateStatus'
      );
      await this.toDoService.updateStatus(id, completed);

      io.emit('update_task_status', { id, status: completed });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public delete = async (
    request: FastifyRequest,
    reply: FastifyReply,
    io: Server
  ): Promise<void> => {
    try {
      const { id } = request.params as { id: string };

      Logger.debug('ToDoController - delete - call toDoService.delete');
      await this.toDoService.delete(id);

      io.emit('delete-task', { id });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public completeInBatch = async (
    request: FastifyRequest,
    reply: FastifyReply,
    io: Server
  ): Promise<void> => {
    try {
      const { ids, completed } = request.body as { ids: string[]; completed: boolean };

      Logger.debug(
        'ToDoController - completeInBatch - call toDoService.completeInBatch'
      );
      await this.toDoService.completeInBatch(ids, completed);

      io.emit('complete_tasks_in_batch', { ids, completed });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public deleteInBatch = async (
    request: FastifyRequest,
    reply: FastifyReply,
    io: Server
  ): Promise<void> => {
    try {
      const { ids } = request.body as { ids: string[]};

      Logger.debug(
        'ToDoController - deleteInBatch - call toDoService.deleteInBatch'
      );
      await this.toDoService.deleteInBatch(ids);

      io.emit('delete_tasks_in_batch', { ids });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };

  public getTodoCount = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      Logger.debug(
        'ToDoController - getTodoCount - call toDoService.getTodoCount'
      );
      const { pending, completed } = await this.toDoService.getTodoCount();

      reply.code(HttpStatusCode.Ok).send({ data: { pending, completed } });
    } catch (error) {
      ErrorHandler.handle(error, reply);
    }
  };
}
