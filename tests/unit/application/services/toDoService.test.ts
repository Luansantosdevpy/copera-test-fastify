import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import toDoRepositoryMock from '../../../mocks/toDoRepositoryMock';
import ToDoService from '../../../../src/application/services/toDoService';
import Logger from '../../../../src/infrastructure/log/logger';
import ToDoRepositoryInterface from '../../../../src/domain/interfaces/repositories/toDoRepositoryInterface';
import ToDoInterface from '../../../../src/domain/interfaces/models/toDoInterface';
import ToDo from '../../../../src/domain/models/toDo';
import UnprocessableEntityError from '../../../../src/application/exceptions/UnprocessableEntityError';
import NotFoundError from '../../../../src/application/exceptions/notFoundError';

describe('ToDoService Testing', () => {
  let toDoService: ToDoService;
  let toDoRepository: ToDoRepositoryInterface;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    toDoRepository = toDoRepositoryMock();
    toDoService = new ToDoService(toDoRepository);
    loggerErrorSpy = jest.spyOn(Logger, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new toDo', async () => {
    const id = uuidv4();
    const toDo = new ToDo({
      id,
      body: 'testing task',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    jest.spyOn(toDoRepository, 'save').mockResolvedValue(toDo);
    await toDoService.create(toDo);

    expect(toDoRepository.save).toHaveBeenCalledTimes(1);
    expect(toDoRepository.save).toHaveBeenCalledWith(toDo);
  });

  it('should get the list of toDos with pagination', async () => {
    const page = 1;
    const limit = 10;
    const mockedToDos: ToDoInterface[] = Array(limit).fill({ id: uuidv4(), body: 'test', completed: true } as Partial<ToDoInterface>);

    jest.spyOn(toDoRepository, 'findAll').mockResolvedValue(mockedToDos);
    const result = await toDoService.findAll(page, limit);

    expect(toDoRepository.findAll).toHaveBeenCalledTimes(1);
    expect(toDoRepository.findAll).toHaveBeenCalledWith(page, limit);
    expect(result).toEqual(mockedToDos);
    expect(result).toHaveLength(limit);
  });

  it('should update a ToDo description by id', async () => {
    const toDoId = '66041b03ae44c5744dd2c9f9';
    const newBody = 'new description';

    const updatedToDo: Partial<ToDoInterface> = {
      id: toDoId,
      body: newBody,
      completed: false,
      completedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      $assertPopulated: jest.fn(),
      $clone: jest.fn(),
    };

    jest.spyOn(toDoRepository, 'findById').mockResolvedValue(Promise.resolve(updatedToDo as ToDoInterface));

    await toDoService.updateDescription(toDoId, newBody);

    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.findById).toHaveBeenCalledWith(toDoId);
    expect(toDoRepository.updateDescription).toHaveBeenCalledTimes(1);
  });

  it('should find the total number of toDos, pending and completed', async () => {
    const mockCounts = {
      pending: 1,
      completed: 2,
    };

    jest.spyOn(toDoRepository, 'countPending').mockResolvedValue(mockCounts.pending);
    jest.spyOn(toDoRepository, 'countCompleted').mockResolvedValue(mockCounts.completed);
    const results = await toDoService.getTodoCount();
    expect(results).toEqual(mockCounts);
    expect(toDoRepository.countPending).toHaveBeenCalledTimes(1);
    expect(toDoRepository.countCompleted).toHaveBeenCalledTimes(1);
  });

  it('should update status of a ToDo', async () => {
    const id = uuidv4();
    const task: Partial<ToDoInterface> = {
      id,
      body: 'test task',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(toDoService, 'findById').mockResolvedValue(Promise.resolve(task as ToDoInterface));
    jest.spyOn(toDoRepository, 'updateStatus').mockResolvedValueOnce();

    await expect(toDoService.updateStatus(id, true)).resolves.toBeUndefined();

    expect(toDoService.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).toHaveBeenCalledWith(id, true);
  });

  it('should not update status of a ToDo if status is the same', async () => {
    const id = uuidv4();
    const task: Partial<ToDoInterface> = {
      id,
      body: 'test task',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(toDoService, 'findById').mockResolvedValue(Promise.resolve(task as ToDoInterface));

    await expect(toDoService.updateStatus(id, true)).rejects.toThrow(UnprocessableEntityError);

    expect(toDoService.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('should delete a ToDo', async () => {
    const id = uuidv4();
    jest.spyOn(toDoService, 'findById').mockResolvedValueOnce({} as ToDoInterface);
    jest.spyOn(toDoRepository, 'delete').mockResolvedValueOnce();

    await expect(toDoService.delete(id)).resolves.toBeUndefined();

    expect(toDoService.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.delete).toHaveBeenCalledTimes(1);
    expect(toDoRepository.delete).toHaveBeenCalledWith(id);
  });

  it('should update description of a ToDo', async () => {
    const id = uuidv4();
    const newDescription = 'New description';
    const task: Partial<ToDoInterface> = {
      id,
      body: 'Old description',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(Promise.resolve(task as ToDoInterface));
    jest.spyOn(toDoRepository, 'updateDescription').mockResolvedValueOnce();

    await toDoService.updateDescription(id, newDescription);

    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.findById).toHaveBeenCalledWith(id);
    expect(toDoRepository.updateDescription).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).toHaveBeenCalledWith(id, newDescription);
  });

  it('should complete tasks in batch', async () => {
    const existingTasks: ToDoInterface[] = [
      { _id: new ObjectId(), body: 'Task 1', completed: false } as ToDoInterface,
      { _id: new ObjectId(), body: 'Task 2', completed: false } as ToDoInterface,
      { _id: new ObjectId(), body: 'Task 3', completed: false } as ToDoInterface
    ];
  
    jest.spyOn(toDoRepository, 'findById')
      .mockImplementation(async (id: string) => {
        return existingTasks.find(task => task._id.toHexString() === id) || null;
      });
  
    const ids = existingTasks.map(task => task._id.toHexString());
    const completed = true;
  
    jest.spyOn(toDoRepository, 'completeInBatch').mockResolvedValueOnce();
  
    await toDoService.completeInBatch(ids, completed);
  
    expect(toDoRepository.completeInBatch).toHaveBeenCalledTimes(1);
    expect(toDoRepository.completeInBatch).toHaveBeenCalledWith(ids, completed);
  });
  it('should delete tasks in batch', async () => {
    const existingTasks: ToDoInterface[] = [
      { _id: new ObjectId(), body: 'Task 1', completed: false } as ToDoInterface,
      { _id: new ObjectId(), body: 'Task 2', completed: false } as ToDoInterface,
      { _id: new ObjectId(), body: 'Task 3', completed: false } as ToDoInterface
    ];
  
    jest.spyOn(toDoRepository, 'findById')
      .mockImplementation(async (id: string) => {
        return existingTasks.find(task => task._id.toHexString() === id) || null;
      });
  
    const ids = existingTasks.map(task => task._id.toHexString());

    jest.spyOn(toDoRepository, 'deleteInBatch').mockResolvedValueOnce();

    await toDoService.deleteInBatch(ids);

    expect(toDoRepository.deleteInBatch).toHaveBeenCalledTimes(1);
    expect(toDoRepository.deleteInBatch).toHaveBeenCalledWith(ids);
});


  it('should get total count of pending and completed tasks', async () => {
    const mockCounts = {
      pending: 5,
      completed: 10,
    };

    jest.spyOn(toDoRepository, 'countPending').mockResolvedValueOnce(mockCounts.pending);
    jest.spyOn(toDoRepository, 'countCompleted').mockResolvedValueOnce(mockCounts.completed);

    const result = await toDoService.getTodoCount();

    expect(result).toEqual(mockCounts);
    expect(toDoRepository.countPending).toHaveBeenCalledTimes(1);
    expect(toDoRepository.countCompleted).toHaveBeenCalledTimes(1);
  });

  it('should throw error when trying to update status of non-existent task', async () => {
    const nonExistentId = uuidv4();
    jest.spyOn(toDoService, 'findById').mockResolvedValueOnce(null);
  
    await expect(toDoService.updateStatus(nonExistentId, true)).rejects.toThrow(NotFoundError);
  
    expect(toDoService.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).not.toHaveBeenCalled();
  });
  
  it('should throw error when trying to delete non-existent task', async () => {
    const nonExistentId = uuidv4();
    jest.spyOn(toDoService, 'findById').mockResolvedValueOnce(null);
  
    await expect(toDoService.delete(nonExistentId)).rejects.toThrow(NotFoundError);
  
    expect(toDoService.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.delete).not.toHaveBeenCalled();
  });
  
  it('should return zero counts when there are no pending or completed tasks', async () => {
    jest.spyOn(toDoRepository, 'countPending').mockResolvedValueOnce(0);
    jest.spyOn(toDoRepository, 'countCompleted').mockResolvedValueOnce(0);
  
    const result = await toDoService.getTodoCount();
  
    expect(result).toEqual({ pending: 0, completed: 0 });
  });
  
  it('should throw error when trying to update description of non-existent task', async () => {
    const nonExistentId = uuidv4();
    const newDescription = 'New description';
  
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);
  
    await expect(toDoService.updateDescription(nonExistentId, newDescription)).rejects.toThrow(NotFoundError);
  
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).not.toHaveBeenCalled();
  });
  
  it('should delete task when it is completed', async () => {
    const taskId = 'completed_task_id';
    const completedTask: Partial<ToDoInterface> = {
      id: taskId,
      body: 'Completed task',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(Promise.resolve(completedTask as ToDoInterface));
    jest.spyOn(toDoRepository, 'delete').mockResolvedValueOnce();
  
    await expect(toDoService.delete(taskId)).rejects.toThrow(UnprocessableEntityError);
  
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.delete).toHaveBeenCalledTimes(0);
  });
  
  it('should throw error when trying to update description of completed task', async () => {
    const taskId = uuidv4();
    const completedTask: Partial<ToDoInterface> = {
      id: taskId,
      body: 'Completed task',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(Promise.resolve(completedTask as ToDoInterface));
  
    await expect(toDoService.updateDescription(taskId, 'Updated description')).rejects.toThrow(UnprocessableEntityError);
  
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).not.toHaveBeenCalled();
  });
  
  
  it('should throw error when trying to update description with invalid task ID', async () => {
    const invalidId = 'invalid_id';
    const newDescription = 'New description';
  
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);
  
    await expect(toDoService.updateDescription(invalidId, newDescription)).rejects.toThrow(NotFoundError);
  
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).not.toHaveBeenCalled();
  });
  
  it('should throw error when trying to update status with invalid task ID', async () => {
    const invalidId = 'invalid_id';
  
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);
  
    await expect(toDoService.updateStatus(invalidId, true)).rejects.toThrow(NotFoundError);
  
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).not.toHaveBeenCalled();
  });
  
  it('should throw error when trying to delete non-existent task', async () => {
    const nonExistentId = 'non_existent_id';
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);
  
    await expect(toDoService.delete(nonExistentId)).rejects.toThrow(NotFoundError);
  
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.delete).not.toHaveBeenCalled();
  });  
  
  it('should throw error when trying to delete completed task', async () => {
    const completedTaskId = 'completed_task_id';
    const completedTask: Partial<ToDoInterface> = {
      id: completedTaskId,
      body: 'Completed task',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(Promise.resolve(completedTask as ToDoInterface));
    
    await expect(toDoService.delete(completedTaskId)).rejects.toThrow(UnprocessableEntityError);
    
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when trying to update description of non-existent task', async () => {
    const nonExistentId = uuidv4();
    const newDescription = 'New description';

    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);

    await expect(toDoService.updateDescription(nonExistentId, newDescription)).rejects.toThrow(NotFoundError);

    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when trying to update status of non-existent task', async () => {
    const nonExistentId = uuidv4();
    const newStatus = false

    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);

    await expect(toDoService.updateStatus(nonExistentId, newStatus)).rejects.toThrow(NotFoundError);
    
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when trying to delete of non-existent task', async () => {
    const nonExistentId = uuidv4();

    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(null);

    await expect(toDoService.delete(nonExistentId)).rejects.toThrow(NotFoundError);
    
    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('should throw UnprocessableEntityError when trying to update description of completed task', async () => {
    const completedTaskId = uuidv4();
    const completedTask: Partial<ToDoInterface> = {
      id: completedTaskId,
      body: 'Completed task',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce(Promise.resolve(completedTask as ToDoInterface));

    await expect(toDoService.updateDescription(completedTaskId, 'Updated description')).rejects.toThrow(UnprocessableEntityError);

    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).not.toHaveBeenCalled();
  });

  it('should throw error when repository throws error while updating description', async () => {
    const taskId = uuidv4();
    const newDescription = 'New description';

    jest.spyOn(toDoRepository, 'findById').mockResolvedValueOnce({} as ToDoInterface);
    jest.spyOn(toDoRepository, 'updateDescription').mockRejectedValueOnce(new Error('Database error'));

    await expect(toDoService.updateDescription(taskId, newDescription)).rejects.toThrow(Error);

    expect(toDoRepository.findById).toHaveBeenCalledTimes(1);
    expect(toDoRepository.updateDescription).toHaveBeenCalledTimes(1);
  });
});