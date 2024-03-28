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

@injectable()
export default class ToDoController {
  constructor(
    @inject(ToDoService)
    public readonly toDoService: ToDoService,
    @inject('socketio')
    private io: Server
  ) {}

  public setSocketInstance(io: Server): void {
    this.io = io;
  }

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
      Logger.error(`ToDoController - findAll - error: ${error}`);
      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public create = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      Logger.debug('ToDoController - create - call toDoService.create');
      const toDo = await this.toDoService.create(request.body!);

      this.io.on("connection", (socket) => {
        socket.emit('task_created', toDo);
      });

      reply.code(HttpStatusCode.Ok).send({ data: toDo });
    } catch (error) {
      Logger.error(`ToDoController - create - error: ${error}`);
      if (error instanceof ValidationError) {
        reply
          .code(HttpStatusCode.UnprocessableEntity)
          .send({ error: error.message });
        return;
      }

      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public findById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;

      Logger.debug('ToDoController - find - call toDoService.find');
      const toDo = await this.toDoService.findById(id);

      reply.code(HttpStatusCode.Ok).send({ data: toDo });
    } catch (error) {
      Logger.error(`ToDoController - find - error: ${error}`);

      if (error instanceof NotFoundError) {
        reply.code(HttpStatusCode.NotFound).send({ error: error.message });
        return;
      }

      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public updateDescription = async (
    request: FastifyRequest<{ Params: { id: string }; Body: { body: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      const { body } = request.body;

      Logger.debug('ToDoController - update - call toDoService.update');
      await this.toDoService.updateDescription(id, body);

      this.io.emit('update_task_description', { id, body: body });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      Logger.error(`ToDoController - update - error: ${error}`);

      if (error instanceof NotFoundError) {
        reply.code(HttpStatusCode.NotFound).send({ error: error.message });
        return;
      }

      if (error instanceof ValidationError) {
        reply
          .code(HttpStatusCode.UnprocessableEntity)
          .send({ error: error.message });
        return;
      }

      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public updateStatus = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { completed: boolean };
    }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      const { completed } = request.body;

      Logger.debug(
        'ToDoController - updateStatus - call toDoService.updateStatus'
      );
      await this.toDoService.updateStatus(id, completed);

      this.io.emit('update_task_status', { id, status: completed });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      Logger.error(`ToDoController - updateStatus - error: ${error}`);

      if (error instanceof NotFoundError) {
        reply.code(HttpStatusCode.NotFound).send({ error: error.message });
        return;
      }

      if (error instanceof UnprocessableEntityError) {
        reply
          .code(HttpStatusCode.UnprocessableEntity)
          .send({ error: error.message });
        return;
      }

      if (error instanceof ValidationError) {
        reply
          .code(HttpStatusCode.UnprocessableEntity)
          .send({ error: error.message });
        return;
      }

      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public delete = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;

      Logger.debug('ToDoController - delete - call toDoService.delete');
      await this.toDoService.delete(id);

      this.io.emit('delete-task', { id });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      Logger.error(`ToDoController - delete - error: ${error}`);

      if (error instanceof NotFoundError) {
        reply.code(HttpStatusCode.NotFound).send({ error: error.message });
        return;
      }

      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public completeInBatch = async (
    request: FastifyRequest<{ Body: { ids: string[]; completed: boolean } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { ids, completed } = request.body;

      Logger.debug(
        'ToDoController - completeInBatch - call toDoService.completeInBatch'
      );
      await this.toDoService.completeInBatch(ids, completed);

      this.io.on("connection", (socket) => {
        socket.emit('complete_tasks_in_batch', { ids, completed });
      });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      Logger.error(`ToDoController - completeInBatch - error: ${error}`);
      if (error instanceof ValidationError) {
        reply
          .code(HttpStatusCode.UnprocessableEntity)
          .send({ error: error.message });
        return;
      }
      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };

  public deleteInBatch = async (
    request: FastifyRequest<{ Body: { ids: string[] } }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { ids } = request.body;

      Logger.debug(
        'ToDoController - deleteInBatch - call toDoService.deleteInBatch'
      );
      await this.toDoService.deleteInBatch(ids);

      this.io.emit('delete_tasks_in_batch', { ids });

      reply.code(HttpStatusCode.NoContent).send();
    } catch (error) {
      Logger.error(`ToDoController - deleteInBatch - error: ${error}`);
      if (error instanceof ValidationError) {
        reply
          .code(HttpStatusCode.UnprocessableEntity)
          .send({ error: error.message });
        return;
      }
      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
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
      Logger.error(`ToDoController - getTodoCount - error: ${error}`);
      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  };
}
