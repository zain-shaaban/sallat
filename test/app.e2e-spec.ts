import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { ResponseFormatInterceptor } from 'src/common/interceptors/response-format.interceptor';
import { AllExceptionFilter } from 'src/common/filters/http-exception.filter';
import { faker } from '@faker-js/faker';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdAccountIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalInterceptors(new ResponseFormatInterceptor());
    app.useGlobalFilters(new AllExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    try {
      // Delete accounts sequentially to avoid overwhelming the server
      for (const id of createdAccountIds) {
        await request(app.getHttpServer())
          .delete(`/api/account/delete/${id}`)
          .expect(HttpStatus.OK);
      }
    } finally {
      await app.close();
    }
  }, 30000); // 30 second timeout for cleanup

  const createTestAccount = (role: AccountRole = AccountRole.CC) => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phoneNumber: faker.phone.number(),
    role,
    salary: faker.number.float({ min: 1000, max: 5000 }),
  });

  describe('Account Management', () => {
    describe('POST /api/account/create', () => {
      it('should create a regular account successfully', async () => {
        const dto = createTestAccount();
        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        createdAccountIds.push(response.body.data.id);
      });

      it('should create a driver account with vehicle number', async () => {
        const dto = {
          ...createTestAccount(AccountRole.DRIVER),
          assignedVehicleNumber: 'VEH123',
          notificationToken: 'test-token',
        };

        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        createdAccountIds.push(response.body.data.id);
      });

      it('should fail with validation error for missing required fields', async () => {
        const dto = {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        };

        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.status).toBe(false);
        expect(typeof response.body.message).toBe('string');
      });

      it('should fail when email already exists', async () => {
        const dto = createTestAccount();
        await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);

        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CONFLICT);

        expect(response.body.message).toBe('Email already exists');
      });
    });

    describe('GET /api/account/find', () => {
      it('should return all accounts', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/account/find')
          .expect(HttpStatus.OK);

        expect(response.body.status).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/account/findbyrole/:role', () => {
      it('should return accounts by role', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/account/findbyrole/${AccountRole.CC}`)
          .expect(HttpStatus.OK);

        expect(response.body.status).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        response.body.data.forEach((account: any) => {
          expect(account.role).toBe(AccountRole.CC);
        });
      });

      it('should return 400 for invalid role', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/account/findbyrole/invalid_role')
          .expect(400);

        expect(response.body).toEqual({
          status: false,
          message: 'Invalid role : invalid_role',
        });
      });
    });

    describe('GET /api/account/find/:id', () => {
      let testAccountId: string;

      beforeAll(async () => {
        const dto = createTestAccount();
        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);
        testAccountId = response.body.data.id;
        createdAccountIds.push(testAccountId);
      });

      it('should return account by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/account/find/${testAccountId}`)
          .expect(HttpStatus.OK);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('id', testAccountId);
      });

      it('should return 404 for non-existent id', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/account/find/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'Account with ID 1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed not found',
        );
      });
    });

    describe('PATCH /api/account/update/:id', () => {
      let testAccountId: string;

      beforeAll(async () => {
        const dto = createTestAccount();
        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);
        testAccountId = response.body.data.id;
        createdAccountIds.push(testAccountId);
      });

      it('should update account successfully', async () => {
        const updateData = {
          name: 'Updated Name',
          phoneNumber: '1234567890',
        };

        const response = await request(app.getHttpServer())
          .patch(`/api/account/update/${testAccountId}`)
          .send(updateData)
          .expect(HttpStatus.OK);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toBeNull();

        const getResponse = await request(app.getHttpServer())
          .get(`/api/account/find/${testAccountId}`)
          .expect(HttpStatus.OK);

        expect(getResponse.body.data.name).toBe(updateData.name);
        expect(getResponse.body.data.phoneNumber).toBe(updateData.phoneNumber);
      });

      it('should update driver metadata', async () => {
        const driverDto = {
          ...createTestAccount(AccountRole.DRIVER),
          assignedVehicleNumber: 'VEH123',
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(driverDto)
          .expect(HttpStatus.CREATED);

        const driverId = createResponse.body.data.id;
        createdAccountIds.push(driverId);

        const updateData = {
          assignedVehicleNumber: 'VEH456',
          notificationToken: 'new-token',
        };

        const response = await request(app.getHttpServer())
          .patch(`/api/account/update/${driverId}`)
          .send(updateData)
          .expect(HttpStatus.OK);

        expect(response.body.status).toBe(true);
      });

      it('should return 404 for non-existent id', async () => {
        const response = await request(app.getHttpServer())
          .patch('/api/account/update/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')
          .send({ name: 'Updated Name' })
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.status).toBe(false);
      });
    });

    describe('DELETE /api/account/delete/:id', () => {
      let testAccountId: string;

      beforeAll(async () => {
        const dto = createTestAccount();
        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);
        testAccountId = response.body.data.id;
      });

      it('should delete account successfully', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/account/delete/${testAccountId}`)
          .expect(HttpStatus.OK);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toBeNull();

        await request(app.getHttpServer())
          .get(`/api/account/find/${testAccountId}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return 404 for non-existent id', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/account/delete/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed')
          .expect(HttpStatus.NOT_FOUND);

        expect(response.body.status).toBe(false);
      });
    });
  });
});
