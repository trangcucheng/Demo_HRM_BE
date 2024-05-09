import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ChangePasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    old_password: string;

    @ApiProperty()
    @IsNotEmpty()
    new_password: string;

    @ApiProperty()
    @IsNotEmpty()
    confirm_password: string;
}
