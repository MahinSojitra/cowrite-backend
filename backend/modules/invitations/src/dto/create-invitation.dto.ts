import { IsEmail, IsIn, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  workspaceId!: string;

  @IsEmail()
  email!: string;

  @IsIn(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'])
  role!: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
}
