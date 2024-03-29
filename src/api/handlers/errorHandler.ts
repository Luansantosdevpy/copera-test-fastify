import { FastifyReply } from 'fastify';
import { Server } from 'socket.io';
import { HttpStatusCode } from 'axios';
import Logger from '../../infrastructure/log/logger';
import ValidationError from '../../application/exceptions/validationError';
import NotFoundError from '../../application/exceptions/notFoundError';
import UnprocessableEntityError from '../../application/exceptions/UnprocessableEntityError';

export default class ErrorHandler {
  static handle(error: any, reply: FastifyReply, io?: Server): void {
    Logger.error(`ToDoController - error: ${error}`);

    if (error instanceof ValidationError) {
      reply
        .code(HttpStatusCode.UnprocessableEntity)
        .send({ error: error.message });
    } else if (error instanceof NotFoundError) {
      reply
        .code(HttpStatusCode.NotFound)
        .send({ error: error.message });
    } else if (error instanceof UnprocessableEntityError) {
      reply
        .code(HttpStatusCode.UnprocessableEntity)
        .send({ error: error.message });
    } else {
      reply
        .code(HttpStatusCode.InternalServerError)
        .send({ error: 'Internal Server Error.' });
    }
  }
}
