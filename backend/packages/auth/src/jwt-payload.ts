export interface JwtPayload {
  sub: string;
  sessionId: string;
  workspaceId?: string;
  roles?: string[];
}

export interface CollabTokenPayload {
  sub: string;
  sessionId: string;
  workspaceId: string;
  documentId: string;
}
