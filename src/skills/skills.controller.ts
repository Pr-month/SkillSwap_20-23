import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillsService.create(req.user.sub, createSkillDto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(req.user.sub, id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.skillsService.remove(req.user.sub, id);
  }
}
