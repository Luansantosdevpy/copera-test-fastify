import ToDoInterface from "../models/toDoInterface";

export default interface ToDoRepositoryInterface {
  save(body: string): Promise<ToDoInterface>;
  findAll(page: number, limit: number): Promise<ToDoInterface[] | null>;
  findById(id: string): Promise<ToDoInterface | null>;
  delete(id: string): Promise<void>;
  updateDescription(id: string, body: string): Promise<void>;
  updateStatus(id: string, completed: boolean): Promise<void>;
  completeInBatch(ids: string[], completed: boolean): Promise<void>;
  deleteInBatch(ids: string[]): Promise<void>;
  countPending(): Promise<number>;
  countCompleted(): Promise<number>;
}
