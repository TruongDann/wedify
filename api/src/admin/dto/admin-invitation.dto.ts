import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAdminInvitationDto {
  @ApiProperty() @IsString() userId!: string;
  @ApiProperty() @IsString() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() eventDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiProperty() @IsObject() contentJson!: Record<string, unknown>;
}

export class UpdateAdminInvitationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() eventDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
  @ApiPropertyOptional({ enum: InvitationStatus }) @IsOptional() @IsEnum(InvitationStatus) status?: InvitationStatus;
  @ApiPropertyOptional() @IsOptional() @IsObject() contentJson?: Record<string, unknown>;
}
