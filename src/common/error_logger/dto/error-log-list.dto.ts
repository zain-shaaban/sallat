import { ApiProperty } from '@nestjs/swagger';

export class ErrorLogListDto {
  @ApiProperty({
    description: 'Unique identifier for the error log',
    example: 1,
  })
  errorID: number;

  @ApiProperty({
    description: 'Error message describing what went wrong',
    example: 'Failed to connect to database',
  })
  message: string;

  @ApiProperty({
    description: 'When the error occurred',
    example: '2024-03-20T10:30:00Z',
  })
  timestamp: Date;
} 