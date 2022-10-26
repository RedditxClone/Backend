import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {
    @ApiProperty()
    email: string
    password: string
    name: string
    birthdate?: Date
    image?: string
}