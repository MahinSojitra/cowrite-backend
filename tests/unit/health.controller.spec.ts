import { HealthController } from '@backend/apps/api/src/health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('returns liveness status', () => {
    expect(controller.liveness()).toEqual({ status: 'ok' });
  });

  it('returns readiness status', () => {
    expect(controller.readiness()).toEqual({ status: 'ok' });
  });
});
