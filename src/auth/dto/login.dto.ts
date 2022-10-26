import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty()
    email: string
    password: string
}