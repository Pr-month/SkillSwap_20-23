import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find--skills.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
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
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Post(':id/favorite')
  @UseGuards(AccessTokenGuard)
  addFavorite(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.skillsService.addFavorite(req.user.sub, id);
  }

  @Delete(':id/favorite')
  @UseGuards(AccessTokenGuard)
  removeFavorite(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.skillsService.removeFavorite(req.user.sub, id);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.skillsService.remove(req.user.sub, id);
  }
}
