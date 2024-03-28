import { FastifyInstance } from 'fastify';
import toDo from './toDo';
import healthCheck from './healthCheck';
import swagger from './swagger';

export default async function v1(fastify: FastifyInstance) {
  fastify.register(toDo);
  fastify.register(healthCheck);
  fastify.register(swagger);
}
