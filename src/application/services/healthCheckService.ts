import { inject, injectable } from 'tsyringe';
import HealthCheckRepositoryInterface from '../../domain/interfaces/repositories/healthCheckRepositoryInterface';
import Logger from '../../infrastructure/log/logger';

@injectable()
export default class HealthCheckService {
  constructor(
    @inject('HealthCheckRepositoryInterface')
    private readonly postgresHealthCheckRepository: HealthCheckRepositoryInterface
  ) {}

  async checkStatusAPI(): Promise<any> {
    Logger.debug(
      'healthCheckService - checkStatusAPI - postgresHealthCheckRepository'
    );
    const postgresCheck = await this.postgresHealthCheckRepository.findStatus();

    const healthcheck = {
      name: 'Copera ai',
      status: 'OK',
      uptime: process.uptime(),
      timestamp: Date.now(),
      checks: [
        {
          name: 'Database',
          status: postgresCheck
        }
      ]
    };

    return healthcheck;
  }
}