import { FastifyInstance, FastifyReply } from 'fastify';

export default async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(require('@fastify/swagger'));

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

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/doc',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });
};
