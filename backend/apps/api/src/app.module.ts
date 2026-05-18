import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@backend/packages/database/src/prisma.module';
import { AuthModule } from '@backend/modules/auth/src/auth.module';
import { WorkspacesModule } from '@backend/modules/workspaces/src/workspaces.module';
import { DocumentsModule } from '@backend/modules/documents/src/documents.module';
import { VersionsModule } from '@backend/modules/versions/src/versions.module';
import { PresenceModule } from '@backend/modules/presence/src/presence.module';
import { AuditModule } from '@backend/modules/audit/src/audit.module';
import { UsersModule } from '@backend/modules/users/src/users.module';
import { CommentsModule } from '@backend/modules/comments/src/comments.module';
import { PermissionsModule } from '@backend/modules/permissions/src/permissions.module';
import { InvitationsModule } from '@backend/modules/invitations/src/invitations.module';
import { NotificationsModule } from '@backend/modules/notifications/src/notifications.module';
import { SearchModule } from '@backend/modules/search/src/search.module';
import { JobsModule } from '@backend/modules/jobs/src/jobs.module';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { workspaceMiddleware } from './common/middleware/workspace.middleware';
import { HealthController } from './health.controller';
import { RbacGuard } from './common/guards/rbac.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    DocumentsModule,
    VersionsModule,
    CommentsModule,
    PermissionsModule,
    InvitationsModule,
    NotificationsModule,
    PresenceModule,
    SearchModule,
    JobsModule
  ],
  controllers: [MetricsController, HealthController],
  providers: [MetricsService, RbacGuard]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(workspaceMiddleware).forRoutes('*path');
  }
}
