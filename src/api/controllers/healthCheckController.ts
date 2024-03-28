import { container, inject, injectable } from 'tsyringe';
import HealthCheckService from '../../application/services/healthCheckService';
import Logger from '../../infrastructure/log/logger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { HttpStatusCode } from 'axios';

@injectable()
export default class HealthCheckController {
  constructor(
    @inject(HealthCheckService)
    public readonly healthCheckService: HealthCheckService
  ) {}
  public async getStatusAPI(request: FastifyRequest, reply: FastifyReply) {
    Logger.debug('healthCheckController - getStatusAPI - healthCheckService');

    const result = await this.healthCheckService.checkStatusAPI();
    reply.code(HttpStatusCode.Ok).send({ data: result });
  }
}
