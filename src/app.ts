import 'reflect-metadata';
import fastify, { FastifyInstance, FastifyReply } from 'fastify';
import routes from './api/routes/routes';
import dbConfig from './infrastructure/data/config/database';
import mongoose from 'mongoose';
import { Server, Socket } from 'socket.io';
import dependencyContainer from './dependencyContainer';
import { container } from 'tsyringe';
import Logger from './infrastructure/log/logger';

export default class App {
  public fastify: FastifyInstance = fastify();
  private port: number;

  public initialize = async (): Promise<void> => {
    await this.connectToMongoDB();
    await this.registerMiddlewares();
    await this.dependencyContainer();
    await this.registerRoutes();
  };

  public start = (port: number, appName: string): void => {
    this.port = port;
  
    const httpServer = this.fastify.server;
  
    const io = new Server(httpServer, {});
  
    io.on('connection', (socket: Socket) => {
      Logger.info('New client connected');
    });
  
    this.fastify.listen({ port: port, host: '0.0.0.0' }, (err) => {
      if (err) {
        Logger.error(`Failed to start ${appName}: ${err}`);
        process.exit(1);
      }
      Logger.info(`${appName} listening on port ${port}!`);
    });
  };

  public stop = async (): Promise<void> => {
    await this.fastify.close();
  };

  private async connectToMongoDB(): Promise<void> {
    try {
      const { uri, options } = dbConfig;
      await mongoose.connect(uri, options);
      Logger.info('Connected to MongoDB');
    } catch (error) {
      Logger.error('Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }

  private async registerMiddlewares(): Promise<void> {
    this.fastify.register(function corsPlugin(fastify, opts, done) {
      fastify.addHook('onRequest', (request, reply: FastifyReply, done) => {
        reply.header('Access-Control-Allow-Origin', '*')
        reply.header('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, PATCH, DELETE')
        reply.header('Access-Control-Expose-Headers', 'X-file-name')
        done()
      });
      done()
    });
    this.fastify.register(require('fastify-sensible'));
  }

  private async dependencyContainer(): Promise<void> {
    await dependencyContainer(container);
  }

  private async registerRoutes(): Promise<void> {
    this.fastify.register(routes);
  }
}

