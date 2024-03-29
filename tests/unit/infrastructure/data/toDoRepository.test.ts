import ToDoRepository from '../../../../src/infrastructure/data/repositories/toDoRepository';
import ToDoModel from '../../../../src/domain/models/toDo';
import Logger from '../../../../src/infrastructure/log/logger';

jest.mock('../../../../src/domain/models/toDo');
jest.mock('../../../../src/infrastructure/log/logger');

describe('ToDoRepository', () => {
  let toDoRepository: ToDoRepository;

  beforeEach(() => {
    toDoRepository = new ToDoRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a new ToDo', async () => {
    const toDoData = {
      id: '123456',
      body: 'Test task',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const toDoInstanceMock: any = {
      ...toDoData,
      save: jest.fn().mockResolvedValue(toDoData),
    };

    (ToDoModel as any).create.mockResolvedValue(toDoInstanceMock);

    const result = await toDoRepository.save(toDoData);

    expect((ToDoModel as any).create).toHaveBeenCalledWith({
      ...toDoData,
      completed: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    const { save, ...resultWithoutSave } = result;
    expect(resultWithoutSave).toEqual(toDoData);
  });

  it('should find all ToDo items with pagination', async () => {
    const page = 1;
    const limit = 10;
    const expectedToDoList = [{ id: '1', body: 'Test 1' }, { id: '2', body: 'Test 2' }];

    const findMock = jest.fn().mockReturnValue(expectedToDoList);
    const sortMock = jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: findMock }) });
    (ToDoModel as any).find.mockReturnValue({ sort: sortMock });

    const result = await toDoRepository.findAll(page, limit);

    expect((ToDoModel as any).find).toHaveBeenCalledWith();
    expect(sortMock).toHaveBeenCalledWith({ name: 1 });
    expect(result).toEqual(expectedToDoList);
  });

  it('should delete a ToDo item', async () => {
    const id = '123456';

    (ToDoModel as any).deleteOne.mockResolvedValue({});

    await toDoRepository.delete(id);

    expect((ToDoModel as any).deleteOne).toHaveBeenCalledWith({ _id: id });
  });

  it('should update the description of a ToDo item', async () => {
    const id = '123456';
    const body = 'Updated description';

    (ToDoModel as any).updateOne.mockResolvedValue({});

    await toDoRepository.updateDescription(id, body);

    expect((ToDoModel as any).updateOne).toHaveBeenCalledWith({ _id: id }, { body: body, updatedAt: expect.any(Date) });
  });

  it('should update the status of a ToDo item', async () => {
    const id = '123456';
    const completedStatus = true;

    (ToDoModel as any).updateOne.mockResolvedValue({});

    await toDoRepository.updateStatus(id, completedStatus);

    expect((ToDoModel as any).updateOne).toHaveBeenCalledWith(
      { _id: id },
      { completed: completedStatus, completedAt: expect.any(Date), updatedAt: expect.any(Date) }
    );
  });

  it('should find a ToDo item by ID', async () => {
    const id = '123456';
    const expectedToDoItem = { id: '1', body: 'Test task' };

    (ToDoModel as any).findById.mockResolvedValue(expectedToDoItem);

    const result = await toDoRepository.findById(id);

    expect((ToDoModel as any).findById).toHaveBeenCalledWith({ _id: id });
    expect(result).toEqual(expectedToDoItem);
  });

  it('should complete multiple ToDo items in batch', async () => {
    const ids = ['123', '456'];
    const completed = true;

    jest.spyOn(toDoRepository, 'updateStatus').mockResolvedValue();

    await toDoRepository.completeInBatch(ids, completed);

    expect(toDoRepository.updateStatus).toHaveBeenCalledTimes(ids.length);
    expect(toDoRepository.updateStatus).toHaveBeenCalledWith(ids[0], completed);
    expect(toDoRepository.updateStatus).toHaveBeenCalledWith(ids[1], completed);
  });

  it('should delete multiple ToDo items in batch', async () => {
    const ids = ['123', '456'];

    jest.spyOn(toDoRepository, 'delete').mockResolvedValue();

    await toDoRepository.deleteInBatch(ids);

    expect(toDoRepository.delete).toHaveBeenCalledTimes(ids.length);
    expect(toDoRepository.delete).toHaveBeenCalledWith(ids[0]);
    expect(toDoRepository.delete).toHaveBeenCalledWith(ids[1]);
  });

  it('should count pending ToDo items', async () => {
    const pendingCount = 5;

    (ToDoModel as any).countDocuments.mockResolvedValue(pendingCount);

    const result = await toDoRepository.countPending();

    expect((ToDoModel as any).countDocuments).toHaveBeenCalledWith({ completed: false });
    expect(result).toEqual(pendingCount);
  });

  it('should count completed ToDo items', async () => {
    const completedCount = 10;

    (ToDoModel as any).countDocuments.mockResolvedValue(completedCount);

    const result = await toDoRepository.countCompleted();

    expect((ToDoModel as any).countDocuments).toHaveBeenCalledWith({ completed: true });
    expect(result).toEqual(completedCount);
  });
});
