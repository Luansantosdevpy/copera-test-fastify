import { Inject, Singleton } from 'typescript-ioc';
import Logger from '../../infrastructure/log/logger';
import ToDoInterface from '../../domain/interfaces/models/toDoInterface';
import ToDoRepositoryInterface from '../../domain/interfaces/repositories/toDoRepositoryInterface';
import { inject, injectable } from 'tsyringe';
import UnprocessableEntityError from '../exceptions/UnprocessableEntityError';

@injectable()
class ToDoService {
  constructor(
    @inject('ToDoRepositoryInterface')
    public readonly toDoRepository: ToDoRepositoryInterface
  ) {}

  async create(toDo: Partial<ToDoInterface>): Promise<ToDoInterface> {
    Logger.debug('ToDoService - create - call toDoRepository.save');
    return this.toDoRepository.save(toDo);
  }

  findAll(page: number = 1, limit: number = 10): Promise<ToDoInterface[] | null> {
    Logger.debug(`ToDoService - findAll - call toDoRepository.findAll with page: ${page} and limit: ${limit}`);
    return this.toDoRepository.findAll(page, limit);
  }

  async updateDescription(id: string, body: string): Promise<void> {
    Logger.debug('ToDoService - update - call ToDoService.find');
    const task = await this.findById(id);
  
    if (!task) {
      throw new UnprocessableEntityError('Task not found');
    }
  
    if (task.completed) {
      throw new UnprocessableEntityError('Cannot update description of a completed task');
    }
  
    Logger.debug('ToDoService - update - call toDoRepository.updateDescription');
    await this.toDoRepository.updateDescription(id, body);
  }

  async updateStatus(id: string, completedStatus: boolean): Promise<void> {
    Logger.debug('ToDoService - updateStatus - call ToDoService.findById');
    const task = await this.findById(id);
  
    if (!task) {
      throw new UnprocessableEntityError('Task not found');
    }
  
    if (task.completed === completedStatus) {
      throw new UnprocessableEntityError('This already the status to the task');
    }
  
    if (completedStatus && task.completed) {
      throw new UnprocessableEntityError('Task is already completed');
    }
  
    Logger.debug('ToDoService - updateStatus - call toDoRepository.updateStatus');
    await this.toDoRepository.updateStatus(id, completedStatus);
  }

  findById(id: string): Promise<ToDoInterface | null> {
    Logger.debug('ToDoService - findById - call toDoRepository.findById');
    return this.toDoRepository.findById(id);
  }

  async delete(id: string): Promise<void> {
    Logger.debug('ToDoService - delete - call toDoRepository.findById');
    const task = await this.findById(id);
  
    if (!task) {
      throw new UnprocessableEntityError('Task not found');
    }
  
    Logger.debug('ToDoService - delete - call toDoRepository.delete');
    await this.toDoRepository.delete(id);
  }

  async completeInBatch(ids: string[], completed: boolean): Promise<void> {
    Logger.debug('ToDoService - completeInBatch - call toDoRepository.completeInBatch');
    await this.toDoRepository.completeInBatch(ids, completed);
  }

  async deleteInBatch(ids: string[]): Promise<void> {
    Logger.debug('ToDoService - deleteInBatch - call toDoRepository.deleteInBatch');
    await this.toDoRepository.deleteInBatch(ids);
  }

  async getTodoCount(): Promise<{ pending: number; completed: number }> {
    const [pending, completed] = await Promise.all([
      this.toDoRepository.countPending(),
      this.toDoRepository.countCompleted(),
    ]);
  
    return { pending, completed };
  }
}

export default ToDoService;