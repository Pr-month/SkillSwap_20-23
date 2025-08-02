import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
        @InjectRepository(Request) private requesRepository: Repository<Request>,
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

    update(id: number, updateRequestDto: UpdateRequestDto) {
        console.log(updateRequestDto);
        return `This action updates a #${id} request`;
    }

    async remove(userId: string, requestId: string) {
        try {
            const user = await this.userService.findUserById(userId);
            const request = await this.requesRepository.findOneOrFail({
                where: { id: requestId },
                relations: ['sender'],
            });

            if (!request.sender) throw new BadRequestException('Reques has no sender');

            if (user.id === request.sender.id || user.role == Role.ADMIN)
                return await this.requesRepository.remove(request);
            else {
                throw new ForbiddenException(
                    'You do not have permission to delete this request',
                );
            }

        } catch (error) {
            if (
                error instanceof ForbiddenException ||
                error instanceof BadRequestException
            ) throw error;
            throw new InternalServerErrorException(
                'Failed to delete request',
                String(error),
            );
        }
    }
}
