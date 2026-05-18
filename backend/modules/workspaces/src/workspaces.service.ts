import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/packages/database/src/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    const existing = await this.prisma.workspace.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Workspace slug already exists');

    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        }
      }
    });
  }
}
