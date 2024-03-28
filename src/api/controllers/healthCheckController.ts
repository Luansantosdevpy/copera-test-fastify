import { inject, injectable } from 'tsyringe';
import Logger from '../../infrastructure/log/logger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpStatusCode } from 'axios';
import HealthCheckService from '../../application/services/healthCheckService';

@injectable()
export default class HealthCheckController {
  constructor(
    @inject(HealthCheckService)
    public readonly healthCheckService: HealthCheckService
  ) {}

  public getStatusAPI = async(request: FastifyRequest, reply: FastifyReply) => {
    Logger.debug('healthCheckController - getStatusAPI - healthCheckService');

    try {
      const result = await this.healthCheckService.checkStatusAPI();
      reply.code(HttpStatusCode.Ok).send({ data: result });
    } catch (error) {
      Logger.error('Error occurred while checking API status:', error);
      reply.code(HttpStatusCode.InternalServerError).send({ error: 'Internal Server Error' });
    }
  }
}
