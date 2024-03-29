import { injectable } from 'tsyringe';
import Logger from '../../log/logger';
import ToDoInterface from '../../../domain/interfaces/models/toDoInterface';
import ToDoModel from '../../../domain/models/toDo';
import ToDoRepositoryInterface from '../../../domain/interfaces/repositories/toDoRepositoryInterface';

@injectable()
export default class ToDoRepository implements ToDoRepositoryInterface {
  async save(toDo: Partial<ToDoInterface>): Promise<ToDoInterface> {
    Logger.debug(`ToDoRepository - create - execute [body: ${toDo}]`);
    const newToDo = await ToDoModel.create({
      ...toDo,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return newToDo;
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<ToDoInterface[]> {
    Logger.debug(
      `ToDoRepository - findAll - execute with page: ${page} and limit: ${limit}`
    );
    return ToDoModel.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async delete(id: string): Promise<void> {
    Logger.debug(`ToDoRepository - delete - execute [id: ${id}]`);
    await ToDoModel.deleteOne({ _id: id });
  }

  async updateDescription(id: string, body: string): Promise<void> {
    Logger.debug(`ToDoRepository - update - execute [id: ${id}]`);
    await ToDoModel.updateOne(
      { _id: id },
      {
        body: body,
        updatedAt: new Date()
      }
    );
  }

  async updateStatus(id: string, completedStatus: boolean): Promise<void> {
    Logger.debug(`ToDoRepository - update - execute [id: ${id}]`);
    await ToDoModel.updateOne(
      { _id: id },
      {
        completed: completedStatus,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    );
  }

  async findById(id: string): Promise<ToDoInterface | null> {
    Logger.debug(`ToDoRepository - findById - execute [id: ${id}]`);
    return await ToDoModel.findById({ _id: id });
  }

  async completeInBatch(ids: string[], completed: boolean): Promise<void> {
    Logger.debug(
      `ToDoRepository - completeInBatch - execute [ids: ${ids}, completed: ${completed}]`
    );
    for (const id of ids) {
      await this.updateStatus(id, completed);
    }
  }

  async deleteInBatch(ids: string[]): Promise<void> {
    Logger.debug(`ToDoRepository - deleteInBatch - execute [ids: ${ids}]`);
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async countPending(): Promise<number> {
    Logger.debug('ToDoRepository - countPending - execute');
    return ToDoModel.countDocuments({ completed: false });
  }

  async countCompleted(): Promise<number> {
    Logger.debug('ToDoRepository - countCompleted - execute');
    return ToDoModel.countDocuments({ completed: true });
  }
}
