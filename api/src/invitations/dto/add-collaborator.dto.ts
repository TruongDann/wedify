import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class AddCollaboratorDto {
  @ApiProperty({ example: 'collaborator@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: CollaboratorRole, default: CollaboratorRole.EDITOR })
  @IsOptional()
  @IsEnum(CollaboratorRole)
  role?: CollaboratorRole;
}
