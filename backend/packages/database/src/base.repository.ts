import { PrismaService } from './prisma.service';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected softDelete<T extends { id: string }>(model: {
    update(args: { where: { id: string }; data: { deletedAt: Date } }): Promise<T>;
  },
  id: string): Promise<T> {
    return model.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
