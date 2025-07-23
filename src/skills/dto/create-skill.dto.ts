import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateSkillDto {
    
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @IsArray()
    images?: string[];

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    ownerId: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    categoryId: string;
}
