import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/types';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER) // Только админ или пользователь
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  remove(@Req() req: AuthenticatedRequest, @Param('id') requestId: string) {
    return this.requestsService.remove(req.user.sub, requestId);
  }
}
