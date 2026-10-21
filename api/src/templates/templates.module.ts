import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplateTaxonomiesController } from './template-taxonomies.controller';
import { TemplateTaxonomiesService } from './template-taxonomies.service';

@Module({
  controllers: [TemplatesController, TemplateTaxonomiesController],
  providers: [TemplatesService, TemplateTaxonomiesService],
})
export class TemplatesModule {}
