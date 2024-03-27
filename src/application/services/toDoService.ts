import { Inject, Singleton } from 'typescript-ioc';
import Logger from '../../infrastructure/log/logger';
import ToDoInterface from '../../domain/interfaces/models/toDoInterface';
import ToDoRepositoryInterface from '../../domain/interfaces/repositories/toDoRepositoryInterface';
import { injectable } from 'tsyringe';

@injectable()
class ToDoService {
  private readonly toDoRepository: ToDoRepositoryInterface;

  constructor(toDoRepository: ToDoRepositoryInterface) {
    this.toDoRepository = toDoRepository;
  }

  async create(body: string): Promise<ToDoInterface> {
    Logger.debug('ToDoService - create - call toDoRepository.save');
    return this.toDoRepository.save(body);
  }

  findAll(page: number = 1, limit: number = 10): Promise<ToDoInterface[] | null> {
    Logger.debug(`ToDoService - findAll - call toDoRepository.findAll with page: ${page} and limit: ${limit}`);
    return this.toDoRepository.findAll(page, limit);
  }

  async updateDescription(id: string, body: string): Promise<void> {
    Logger.debug('ToDoService - update - call ToDoService.find');
    await this.findById(id);

    Logger.debug('ToDoService - update - call toDoRepository.updateDescription');
    await this.toDoRepository.updateDescription(id, body);
  }

  async updateStatus(id: string, completedStatus: boolean): Promise<void> {
    Logger.debug('ToDoService - updateStatus - call ToDoService.findById');
    await this.findById(id);

    Logger.debug('ToDoService - updateStatus - call toDoRepository.updateStatus');
    await this.toDoRepository.updateStatus(id, completedStatus);
  }

  findById(id: string): Promise<ToDoInterface | null> {
    Logger.debug('ToDoService - findById - call toDoRepository.findById');
    return this.toDoRepository.findById(id);
  }

  async delete(id: string): Promise<void> {
    Logger.debug('ToDoService - delete - call toDoRepository.findById');
    await this.findById(id);

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