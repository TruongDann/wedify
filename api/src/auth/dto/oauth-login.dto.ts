import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export class OAuthLoginDto {
  @ApiProperty({ enum: OAuthProvider })
  @IsEnum(OAuthProvider)
  provider!: OAuthProvider;

  @ApiProperty({ description: 'Access token do Google/Facebook SDK cấp' })
  @IsString()
  accessToken!: string;
}
