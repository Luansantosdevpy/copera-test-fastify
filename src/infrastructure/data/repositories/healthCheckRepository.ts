import { injectable } from 'tsyringe';
import HealthCheckRepositoryInterface from '../../../domain/interfaces/repositories/healthCheckRepositoryInterface';
import Logger from '../../log/logger';

@injectable()
export default class HealthCheckRepository
  implements HealthCheckRepositoryInterface
{
  constructor() {}

  async findStatus(): Promise<string> {
    Logger.debug('healthCheckRepository - findStatus - Mongodb');
    try {
      return 'Ok';
    } catch (error) {
      return 'ERROR';
    }
  }
}
