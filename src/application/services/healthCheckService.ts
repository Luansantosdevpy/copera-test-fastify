import { inject, injectable } from 'tsyringe';
import HealthCheckRepositoryInterface from '../../domain/interfaces/repositories/healthCheckRepositoryInterface';
import Logger from '../../infrastructure/log/logger';
import CheckStatusApi from '../../domain/interfaces/outputInterfaces/checkStatusInterface';

@injectable()
class HealthCheckService {
  constructor(
    @inject('HealthCheckRepositoryInterface')
    private readonly postgresHealthCheckRepository: HealthCheckRepositoryInterface
  ) {}

  async checkStatusAPI(): Promise<CheckStatusApi> {
    Logger.debug(
      'healthCheckService - checkStatusAPI - postgresHealthCheckRepository'
    );
    const mongoCheck = await this.postgresHealthCheckRepository.findStatus();

    const healthcheck: CheckStatusApi = {
      name: 'Copera ai',
      status: 'OK',
      uptime: process.uptime(),
      timestamp: Date.now(),
      checks: [
        {
          name: 'Database',
          status: mongoCheck
        }
      ]
    };

    return healthcheck;
  }
}

export default HealthCheckService;