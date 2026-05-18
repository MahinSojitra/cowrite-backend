import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { getEnv } from '@backend/packages/config/src/env';
import { PrismaService } from '@backend/packages/database/src/prisma.service';
import { password } from '@backend/packages/auth/src/password';
import { JwtPayload } from '@backend/packages/auth/src/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(email: string, plainPassword: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await password.verify(user.passwordHash, plainPassword);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenFamily: randomUUID(),
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    const payload: JwtPayload = { sub: user.id, sessionId: session.id, roles: [] };
    const env = getEnv();

    const accessToken = await this.jwtService.signAsync(payload as unknown as Record<string, unknown>, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_TTL as any
    });

    const refreshToken = await this.jwtService.signAsync(payload as unknown as Record<string, unknown>, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_TTL as any
    });

    return { accessToken, refreshToken };
  }

  async issueCollabToken(userId: string, sessionId: string, workspaceId: string, documentId: string): Promise<string> {
    const env = getEnv();
    return this.jwtService.signAsync(
      { sub: userId, sessionId, workspaceId, documentId },
      { secret: env.JWT_COLLAB_SECRET, expiresIn: `${env.COLLAB_TOKEN_TTL_SECONDS}s` as any }
    );
  }
}
