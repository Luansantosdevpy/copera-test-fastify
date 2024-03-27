import { FastifyInstance } from 'fastify';
import toDo from './toDo';

export default async function v1(fastify: FastifyInstance) {
  fastify.register(toDo, { prefix: '/todo' });
}