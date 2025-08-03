import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/common/types';

@Injectable()
export class RequestsService {
    constructor(
        @InjectRepository(Request) private requestRepository: Repository<Request>,
        private readonly userService: UsersService,
    ) { }

    create(createRequestDto: CreateRequestDto) {
        console.log(createRequestDto);
        return 'This action adds a new request';
    }

    findAll() {
        return `This action returns all requests`;
    }

    findOne(id: number) {
        return `This action returns a #${id} request`;
    }

    async update(requestId: string, updateRequestDto: UpdateRequestDto, userId: string) {
        const request = await this.requestRepository.findOneOrFail({
            where: {
                id: requestId,
            },
        });

        const user = await this.userService.findUserById(userId);

        if (user.id !== request.sender.id || user.role !== Role.ADMIN)
            throw new ForbiddenException('Недостаточно прав');

        return this.requestRepository.save({
            ...request,
            ...updateRequestDto,
        });
    }

    remove(id: number) {
        return `This action removes a #${id} request`;
    }
}
