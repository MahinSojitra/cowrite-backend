import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('collab-token')
  issueCollabToken(
    @Req() req: { user: { sub: string; sessionId: string } },
    @Body() body: { workspaceId: string; documentId: string }
  ): Promise<string> {
    return this.authService.issueCollabToken(req.user.sub, req.user.sessionId, body.workspaceId, body.documentId);
  }
}
