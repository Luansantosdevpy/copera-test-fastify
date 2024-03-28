import { FastifyInstance } from 'fastify';
import v1 from './v1/v1';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(v1, { prefix: '/api' });
}
