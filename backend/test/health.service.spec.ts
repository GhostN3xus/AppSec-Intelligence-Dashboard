import { HealthService } from '../src/modules/health/health.service';

describe('HealthService', () => {
  const now = new Date('2024-01-10T10:00:00Z');

  const prismaMock = {
    $transaction: jest.fn().mockResolvedValue([
      4,
      2,
      3,
      { createdAt: now },
      { createdAt: now },
      { updatedAt: now },
    ]),
  } as any;

  it('returns module statuses with health metadata', async () => {
    const service = new HealthService(prismaMock);
    const result = await service.moduleStatuses();

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    const calls = prismaMock.$transaction.mock.calls[0][0];
    expect(calls).toHaveLength(6);

    expect(result.modules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'sast', status: 'operational', totalFindings: 4 }),
        expect.objectContaining({ id: 'sca', status: 'operational', totalFindings: 2 }),
        expect.objectContaining({ id: 'reports', status: 'operational', totalFindings: 3 }),
      ]),
    );
  });
});
