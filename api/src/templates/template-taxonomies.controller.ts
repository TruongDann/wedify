import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTemplateTaxonomyDto, UpdateTemplateTaxonomyDto } from './dto/template-taxonomy.dto';
import { TemplateTaxonomiesService } from './template-taxonomies.service';

@ApiTags('template-taxonomies')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller()
export class TemplateTaxonomiesController {
  constructor(private service: TemplateTaxonomiesService) {}

  @Get('template-categories') categories() { return this.service.categories(); }
  @Post('template-categories') createCategory(@Body() dto: CreateTemplateTaxonomyDto) { return this.service.createCategory(dto); }
  @Patch('template-categories/:id') updateCategory(@Param('id') id: string, @Body() dto: UpdateTemplateTaxonomyDto) { return this.service.updateCategory(id, dto); }
  @Delete('template-categories/:id') removeCategory(@Param('id') id: string) { return this.service.removeCategory(id); }

  @Get('template-styles') styles() { return this.service.styles(); }
  @Post('template-styles') createStyle(@Body() dto: CreateTemplateTaxonomyDto) { return this.service.createStyle(dto); }
  @Patch('template-styles/:id') updateStyle(@Param('id') id: string, @Body() dto: UpdateTemplateTaxonomyDto) { return this.service.updateStyle(id, dto); }
  @Delete('template-styles/:id') removeStyle(@Param('id') id: string) { return this.service.removeStyle(id); }
}
