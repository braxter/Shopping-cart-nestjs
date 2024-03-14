import { ApiProperty } from '@nestjs/swagger';

export class NotFoundResponse {
  @ApiProperty({
    example: 'Not Found',
  })
  message: string;

  @ApiProperty({
    description: 'Status code of response',
    example: 404,
  })
  statusCode: number;
}
