import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import paths from '../../../swagger/paths';

export default async (fastify: FastifyInstance): Promise<void> => {
  fastify.register(function corsPlugin(fastify, opts, done) {
    fastify.addHook('onRequest', (request, reply: FastifyReply, done) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header(
        'Access-Control-Allow-Methods',
        'POST, GET, PUT, OPTIONS, PATCH, DELETE'
      );
      reply.header('Access-Control-Expose-Headers', 'X-file-name');
      done();
    });
    done();
  });

  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    if (request.routerPath === '/api/doc/json') {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
  });

  await fastify.register(require('@fastify/swagger'), {
    exposeRoute: true,
    swagger: {
      info: {
        title: 'Api de controle de tarefas',
        version: '1.0.0',
      },
      host: 'localhost:3500',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      paths,
    },
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/doc',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });
};
