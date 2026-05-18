export interface DomainEvent<T = Record<string, unknown>> {
  eventName: string;
  workspaceId?: string;
  actorId?: string;
  occurredAt: string;
  payload: T;
}
