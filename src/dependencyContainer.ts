import { DependencyContainer } from 'tsyringe';
import Logger from './infrastructure/log/logger';
import ToDoRepositoryInterface from './domain/interfaces/repositories/toDoRepositoryInterface';
import ToDoRepository from './infrastructure/data/repositories/toDoRepository';
import ToDoService from './application/services/toDoService';
import HealthCheckRepositoryInterface from './domain/interfaces/repositories/healthCheckRepositoryInterface';
import HealthCheckRepository from './infrastructure/data/repositories/healthCheckRepository';
import HealthCheckService from './application/services/healthCheckService';
import { Server } from 'socket.io';

export default async (container: DependencyContainer): Promise<void> => {
  Logger.debug('Dependency container initializing...');

  container.register<HealthCheckRepositoryInterface>(
    'HealthCheckRepositoryInterface',
    {
      useClass: HealthCheckRepository
    }
  );

  container.register<HealthCheckService>('HealthCheckService', {
    useClass: HealthCheckService
  });
  
  container.register<ToDoRepositoryInterface>(
    'ToDoRepositoryInterface',
    {
      useClass: ToDoRepository
    }
  );

  container.register<ToDoService>('ToDoService', {
    useClass: ToDoService
  });

  container.register('socketio', {
    useValue: new Server()
  });

  Logger.debug('Dependency container initialized!');
};
