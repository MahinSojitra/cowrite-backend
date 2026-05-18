import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getEnv } from '@backend/packages/config/src/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getEnv().JWT_ACCESS_SECRET
    });
  }

  validate(payload: { sub: string; sessionId: string; roles?: string[] }): { sub: string; sessionId: string; roles: string[] } {
    return { sub: payload.sub, sessionId: payload.sessionId, roles: payload.roles ?? [] };
  }
}
