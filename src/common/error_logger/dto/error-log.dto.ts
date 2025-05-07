import { ApiProperty } from '@nestjs/swagger';

export class ErrorLogDto {
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
    description: 'Stack trace of the error (if available)',
    example: 'Error: Connection refused\n    at Database.connect (/app/src/db.js:10:15)',
    required: false,
  })
  stack?: string;

  @ApiProperty({
    description: 'When the error occurred',
    example: '2024-03-20T10:30:00Z',
  })
  timestamp: Date;
} 