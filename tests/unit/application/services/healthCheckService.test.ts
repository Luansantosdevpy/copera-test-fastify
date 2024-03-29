import HealthCheckService from '../../../../src/application/services/healthCheckService';
import HealthCheckRepositoryInterface from '../../../../src/domain/interfaces/repositories/healthCheckRepositoryInterface';

describe('HealthCheckService Testing - checkStatusAPI', () => {
  let healthCheckService: HealthCheckService;
  let healthCheckRepository: HealthCheckRepositoryInterface;

  beforeEach(() => {
    healthCheckRepository = {
      findStatus: jest.fn()
    };
    healthCheckService = new HealthCheckService(healthCheckRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return API status', async () => {
    const databaseStatus = 'OK';
    jest.spyOn(healthCheckRepository, 'findStatus').mockResolvedValueOnce(databaseStatus);

    const status = await healthCheckService.checkStatusAPI();

    expect(healthCheckRepository.findStatus).toHaveBeenCalledTimes(1);

    expect(status).toHaveProperty('name');
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('uptime');
    expect(status).toHaveProperty('timestamp');
    expect(status).toHaveProperty('checks');
    expect(status.checks).toHaveLength(1);
    expect(status.checks[0]).toHaveProperty('name', 'Database');
    expect(status.checks[0]).toHaveProperty('status', databaseStatus);
  });
});
