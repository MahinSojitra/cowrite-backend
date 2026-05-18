import { Injectable } from '@nestjs/common';
import client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new client.Registry();
  private readonly httpDuration = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [this.registry]
  });

  observeHttp(method: string, route: string, statusCode: number, durationMs: number): void {
    this.httpDuration.labels(method, route, String(statusCode)).observe(durationMs);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
