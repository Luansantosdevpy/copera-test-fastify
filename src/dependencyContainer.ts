import { FastifyInstance } from 'fastify';
import Logger from './infrastructure/log/logger';
import ToDoRepository from './infrastructure/data/repositories/toDoRepository';
import ToDoService from './application/services/toDoService';
import { DependencyContainer } from 'tsyringe';
import ToDoRepositoryInterface from './domain/interfaces/repositories/toDoRepositoryInterface';

export default async (container: DependencyContainer): Promise<void> => {
    Logger.debug('Dependency container initializing...');
  
    container.register<ToDoRepositoryInterface>(
      'ToDoRepositoryInterface',
      {
        useClass: ToDoRepository
      }
    );
  
    container.register<ToDoService>('ToDoService', {
      useClass: ToDoService
    });
  
    Logger.debug('Dependency container initialized!');
  };
  
