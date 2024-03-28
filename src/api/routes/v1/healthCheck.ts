import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import HealthCheckController from '../../controllers/healthCheckController';

export default async (fastify: FastifyInstance): Promise<void> => {
  const healthCheckController = container.resolve(HealthCheckController);

  fastify.get('/', healthCheckController.getStatusAPI);
};
