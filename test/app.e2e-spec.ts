import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AccountRole } from 'src/account/enums/account-role.enum';
import { ResponseFormatInterceptor } from 'src/common/interceptors/response-format.interceptor';
import { AllExceptionFilter } from 'src/common/filters/http-exception.filter';
import { faker } from '@faker-js/faker';
import { CreateCustomerDtoRequest } from '../src/customer/dto/create-customer.dto';
import { UpdateCustomerDto } from '../src/customer/dto/update-customer.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdAccountIds: string[] = [];

  const createTestAccount = (role: AccountRole = AccountRole.CC) => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    role,
    salary: faker.number.float({ min: 1000, max: 5000 }),
  });

  afterAll(async () => {
    try {
      for (const id of createdAccountIds) {
        await request(app.getHttpServer())
          .delete(`/api/account/delete/${id}`)
          .expect(HttpStatus.OK);
      }
    } finally {
      await app.close();
    }
  }, 30000);

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
        const respo = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(HttpStatus.CREATED);

        createdAccountIds.push(respo.body.data.id);

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

  describe('Auth Managment', () => {
    describe('POST /api/auth/login', () => {
      const dto = createTestAccount();

      beforeAll(async () => {
        const response = await request(app.getHttpServer())
          .post('/api/account/create')
          .send(dto)
          .expect(201);

        createdAccountIds.push(response.body.data.id);
      });

      it('login with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: dto.email, password: dto.password })
          .expect(200);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('accessToken');
      });

      it('login with wrong credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: dto.email, password: faker.internet.password() })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toEqual({
          status: false,
          message: 'Wrong credentials',
        });
      });

      it('login without email', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ password: dto.password })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.status).toBe(false);
        expect(typeof response.body.message).toBe('string');
      });
    });
  });

  describe('Category/Item Managment', () => {
    const category = faker.food.ethnicCategory();
    const type = faker.food.dish();

    describe('GET /api/category', () => {
      it('should return all categories', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/category')
          .expect(200);

        expect(response.body.status).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      describe('POST /api/category/add', () => {
        it('should create a new category', () => {
          return request(app.getHttpServer())
            .post('/api/category/add')
            .send({ type: category })
            .expect(201)
            .expect((res) => {
              expect(res.body.status).toBe(true);
            });
        });

        it('should create a new type under existing category', () => {
          return request(app.getHttpServer())
            .post('/api/category/add')
            .send({ type: type, category: category })
            .expect(201)
            .expect((res) => {
              expect(res.body.status).toBe(true);
            });
        });

        it('should not create duplicate category', () => {
          return request(app.getHttpServer())
            .post('/api/category/add')
            .send({ type: category })
            .expect(409)
            .expect((res) => {
              expect(res.body.status).toBe(false);
            });
        });

        it('should not create duplicate type in same category', () => {
          return request(app.getHttpServer())
            .post('/api/category/add')
            .send({ type: type, category: category })
            .expect(409)
            .expect((res) => {
              expect(res.body.status).toBe(false);
            });
        });
      });

      describe('PATCH /api/category/update', () => {
        it('should update a category name', () => {
          return request(app.getHttpServer())
            .patch('/api/category/update')
            .send({
              isCategory: true,
              oldType: category,
              newType: 'UpdatedCategory',
            })
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe(true);
            });
        });

        it('should update a type name', () => {
          return request(app.getHttpServer())
            .patch('/api/category/update')
            .send({
              isCategory: false,
              oldType: type,
              newType: 'UpdatedItem',
            })
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe(true);
            });
        });

        it('should return 404 when updating non-existent category', () => {
          return request(app.getHttpServer())
            .patch('/api/category/update')
            .send({
              isCategory: true,
              oldType: 'NonExistentCategory',
              newType: 'NewName',
            })
            .expect(404);
        });

        it('should return 404 when updating non-existent type', () => {
          return request(app.getHttpServer())
            .patch('/api/category/update')
            .send({
              isCategory: false,
              oldType: 'NonExistentType',
              newType: 'NewName',
            })
            .expect(404);
        });
      });

      describe('DELETE /api/category/delete', () => {
        it('should delete a Item', () => {
          return request(app.getHttpServer())
            .delete('/api/category/delete')
            .send({
              isCategory: false,
              type: 'UpdatedItem',
            })
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe(true);
            });
        });

        it('should delete a Category', () => {
          return request(app.getHttpServer())
            .delete('/api/category/delete')
            .send({
              isCategory: true,
              type: 'UpdatedCategory',
            })
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe(true);
            });
        });

        it('should return 404 when deleting non-existent category', () => {
          return request(app.getHttpServer())
            .delete('/api/category/delete')
            .send({
              isCategory: true,
              type: 'NonExistentCategory',
            })
            .expect(404);
        });

        it('should return 404 when deleting non-existent type', () => {
          return request(app.getHttpServer())
            .delete('/api/category/delete')
            .send({
              isCategory: false,
              type: 'NonExistentType',
            })
            .expect(404);
        });
      });
    });
  });

  describe('Customer Managment', () => {
    let createdCustomerId: string;
    const testCustomer: CreateCustomerDtoRequest = {
      name: faker.person.fullName(),
      phoneNumbers: [
        faker.phone.number({ style: 'international' }),
        faker.phone.number({ style: 'international' }),
      ],
      location: {
        coords: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
        approximate: true,
        description: 'Test Location',
      },
    };
    describe('POST /api/customer/add', () => {
      it('should create a new customer', () => {
        return request(app.getHttpServer())
          .post('/api/customer/add')
          .send(testCustomer)
          .expect(201)
          .expect((res) => {
            expect(res.body.status).toBe(true);
            expect(res.body.data).toHaveProperty('customerID');
            createdCustomerId = res.body.data.customerID;
          });
      });

      it('should fail to create customer with invalid data', () => {
        const invalidCustomer = {
          name: faker.person.fullName(),
          phoneNumbers: [],
        };

        return request(app.getHttpServer())
          .post('/api/customer/add')
          .send(invalidCustomer)
          .expect(400)
          .expect((res) => {
            expect(res.body.status).toBe(false);
          });
      });
    });

    describe('GET /api/customer', () => {
      it('should return all customers', () => {
        return request(app.getHttpServer())
          .get('/api/customer')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            const customer = res.body.data.find(
              (c) => c.customerID === createdCustomerId,
            );
            expect(customer).toBeDefined();
            expect(customer.name).toBe(testCustomer.name);
          });
      });
    });

    describe('GET /api/customer/onMap', () => {
      it('should return customers with location data', () => {
        return request(app.getHttpServer())
          .get('/api/customer/onMap')
          .expect(200)
          .expect((res) => {
            expect(res.body.status).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            const customer = res.body.data.find(
              (c) => c.customerID === createdCustomerId,
            );
            expect(customer).toBeDefined();
            expect(customer).toHaveProperty('location');
            expect(customer.location.coords).toEqual(
              testCustomer.location.coords,
            );
          });
      });
    });

    describe('GET /api/customer/:customerID', () => {
      it('should return a specific customer', () => {
        return request(app.getHttpServer())
          .get(`/api/customer/${createdCustomerId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.customerID).toBe(createdCustomerId);
            expect(res.body.data.name).toBe(testCustomer.name);
            expect(res.body.data.phoneNumber).toBe(
              testCustomer.phoneNumbers[0],
            );
          });
      });

      it('should return 404 for non-existent customer', () => {
        return request(app.getHttpServer())
          .get('/api/customer/683aa0bd-5014-8010-920d-2e287f509338')
          .expect(404)
          .expect((res) => {
            expect(res.body).toEqual({
              status: false,
              message: `Customer with ID 683aa0bd-5014-8010-920d-2e287f509338 not found`,
            });
          });
      });
    });

    describe('PATCH /api/customer/update/:customerID', () => {
      const updateData: UpdateCustomerDto = {
        name: faker.person.fullName(),
        phoneNumbers: [faker.phone.number({ style: 'international' })],
        location: {
          coords: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
          },
          approximate: false,
          description: 'Updated Location',
        },
      };

      it('should update customer successfully', () => {
        return request(app.getHttpServer())
          .patch(`/api/customer/update/${createdCustomerId}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.status).toBe(true);
            expect(res.body.data).toBeNull();
          });
      });

      it('should verify customer was updated', () => {
        return request(app.getHttpServer())
          .get(`/api/customer/${createdCustomerId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.phoneNumber).toBe(updateData.phoneNumbers[0]);
            expect(res.body.data.location.coords).toEqual(
              updateData.location.coords,
            );
          });
      });

      it('should return 404 when updating non-existent customer', () => {
        return request(app.getHttpServer())
          .patch('/api/customer/update/683aa0bd-5014-8010-920d-2e287f509338')
          .send(updateData)
          .expect(404)
          .expect((res) => {
            expect(res.body).toEqual({
              status: false,
              message: `Customer with ID 683aa0bd-5014-8010-920d-2e287f509338 not found`,
            });
          });
      });
    });

    describe('DELETE /api/customer/delete/:customerID', () => {
      it('should delete customer successfully', () => {
        return request(app.getHttpServer())
          .delete(`/api/customer/delete/${createdCustomerId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.status).toBe(true);
          });
      });

      it('should verify customer was deleted', () => {
        return request(app.getHttpServer())
          .get(`/api/customer/${createdCustomerId}`)
          .expect(404);
      });

      it('should return 404 when deleting non-existent customer', () => {
        return request(app.getHttpServer())
          .delete('/api/customer/delete/683aa0bd-5014-8010-920d-2e287f509338')
          .expect(404)
          .expect((res) => {
            expect(res.body).toEqual({
              status: false,
              message: `Customer with ID 683aa0bd-5014-8010-920d-2e287f509338 not found`,
            });
          });
      });
    });
  });

  describe('Vendor Management', () => {
    let createdVendorId: string;
    const testVendor = {
      name: faker.company.name(),
      phoneNumber: faker.phone.number({ style: 'international' }),
      location: {
        coords: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
        approximate: true,
        description: 'Test Location',
      },
    };

    describe('POST /api/vendor/add', () => {
      it('should create a new vendor', () => {
        return request(app.getHttpServer())
          .post('/api/vendor/add')
          .send(testVendor)
          .expect(201)
          .expect((res) => {
            expect(res.body.status).toBe(true);
            expect(res.body.data).toHaveProperty('vendorID');
            createdVendorId = res.body.data.vendorID;
          });
      });

      it('should fail to create vendor with invalid data', () => {
        const invalidVendor = {
          name: faker.company.name(),
          phoneNumber: 'invalid-phone',
        };

        return request(app.getHttpServer())
          .post('/api/vendor/add')
          .send(invalidVendor)
          .expect(400)
          .expect((res) => {
            expect(res.body.status).toBe(false);
          });
      });
    });

    describe('GET /api/vendor', () => {
      it('should return all vendors', () => {
        return request(app.getHttpServer())
          .get('/api/vendor')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            const vendor = res.body.data.find(
              (v) => v.vendorID === createdVendorId,
            );
            expect(vendor).toBeDefined();
            expect(vendor.name).toBe(testVendor.name);
          });
      });
    });

    describe('GET /api/vendor/onMap', () => {
      it('should return vendors with location data', () => {
        return request(app.getHttpServer())
          .get('/api/vendor/onMap')
          .expect(200)
          .expect((res) => {
            expect(res.body.status).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            const vendor = res.body.data.find(
              (v) => v.vendorID === createdVendorId,
            );
            expect(vendor).toBeDefined();
            expect(vendor).toHaveProperty('location');
            expect(vendor.location.coords).toEqual(testVendor.location.coords);
          });
      });
    });

    describe('PATCH /api/vendor/update/:vendorID', () => {
      const updateData = {
        name: faker.company.name(),
        phoneNumber: faker.phone.number({ style: 'international' }),
        location: {
          coords: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
          },
          approximate: false,
          description: 'Updated Location',
        },
      };

      it('should update vendor successfully', () => {
        return request(app.getHttpServer())
          .patch(`/api/vendor/update/${createdVendorId}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body.status).toBe(true);
            expect(res.body.data).toBeNull();
          });
      });

      it('should verify vendor was updated', () => {
        return request(app.getHttpServer())
          .get(`/api/vendor/${createdVendorId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.phoneNumber).toBe(updateData.phoneNumber);
            expect(res.body.data.location.coords).toEqual(
              updateData.location.coords,
            );
          });
      });

      it('should return 404 when updating non-existent vendor', () => {
        return request(app.getHttpServer())
          .patch('/api/vendor/update/683aa0bd-5014-8010-920d-2e287f509338')
          .send(updateData)
          .expect(404)
          .expect((res) => {
            expect(res.body).toEqual({
              status: false,
              message:
                'Vendor with ID 683aa0bd-5014-8010-920d-2e287f509338 not found',
            });
          });
      });
    });

    describe('DELETE /api/vendor/delete/:vendorID', () => {
      it('should delete vendor successfully', () => {
        return request(app.getHttpServer())
          .delete(`/api/vendor/delete/${createdVendorId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.status).toBe(true);
          });
      });

      it('should verify vendor was deleted', () => {
        return request(app.getHttpServer())
          .get(`/api/vendor/${createdVendorId}`)
          .expect(404);
      });

      it('should return 404 when deleting non-existent vendor', () => {
        return request(app.getHttpServer())
          .delete('/api/vendor/delete/683aa0bd-5014-8010-920d-2e287f509338')
          .expect(404)
          .expect((res) => {
            expect(res.body).toEqual({
              status: false,
              message:
                'Vendor with ID 683aa0bd-5014-8010-920d-2e287f509338 not found',
            });
          });
      });
    });
  });

  describe('Trip Management', () => {
    let createdTripId: string;
    let createdAlternativeTripId: string;
    let createdCustomerId: string;
    let createdVendorId: string;

    const testCustomer = {
      name: faker.person.fullName(),
      phoneNumbers: [
        faker.phone.number({ style: 'international' }),
        faker.phone.number({ style: 'international' }),
      ],
      location: {
        coords: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
        approximate: true,
        description: 'Test Location',
      },
    };

    const testVendor = {
      name: faker.company.name(),
      phoneNumber: faker.phone.number({ style: 'international' }),
      location: {
        coords: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
        approximate: true,
        description: 'Test Location',
      },
    };

    beforeAll(async () => {
      const customerResponse = await request(app.getHttpServer())
        .post('/api/customer/add')
        .send(testCustomer)
        .expect(201);
      createdCustomerId = customerResponse.body.data.customerID;

      const vendorResponse = await request(app.getHttpServer())
        .post('/api/vendor/add')
        .send(testVendor)
        .expect(201);
      createdVendorId = vendorResponse.body.data.vendorID;
    });

    afterAll(async() => {
      await request(app.getHttpServer())
        .delete(`/api/customer/delete/${createdCustomerId}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/vendor/delete/${createdVendorId}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/api/trip/${createdAlternativeTripId}`)
        .expect(200);
    });

    describe('POST /api/trip/submit', () => {
      it('should create a regular trip successfully', async () => {
        const tripData = {
          vendorID: createdVendorId,
          customerID: createdCustomerId,
          customerPhoneNumber: testCustomer.phoneNumbers[0],
          customerAlternativePhoneNumbers: [testCustomer.phoneNumbers[1]],
          itemTypes: [faker.food.dish(), faker.food.dish()],
          description: faker.food.description(),
          approxDistance: faker.number.int(),
          approxPrice: faker.number.int(),
          approxTime: faker.number.int(),
          routedPath: [
            { lng: faker.location.longitude(), lat: faker.location.latitude() },
            { lng: faker.location.longitude(), lat: faker.location.latitude() },
            { lng: faker.location.longitude(), lat: faker.location.latitude() },
          ],
          alternative: false,
        };
        const response = await request(app.getHttpServer())
          .post('/api/trip/submit')
          .send(tripData)
          .expect(201);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('tripID');
        createdTripId = response.body.data.tripID;
      });

      it('should create an alternative trip successfully', async () => {
        const tripData = {
          customerID: createdCustomerId,
          customerPhoneNumber: testCustomer.phoneNumbers[0],
          customerAlternativePhoneNumbers: [testCustomer.phoneNumbers[1]],
          itemTypes: [faker.food.dish(), faker.food.dish()],
          description: faker.food.description(),
          alternative: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/trip/submit')
          .send(tripData)
          .expect(201);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('tripID');

        createdAlternativeTripId = response.body.data.tripID;
      });

      it('should fail with validation error for missing required fields', async () => {
        const invalidTripData = {
          driverID: '683aa0bd-5014-8010-920d-2e287f509338',
          customerPhoneNumber: testCustomer.phoneNumbers[0],
        };

        const response = await request(app.getHttpServer())
          .post('/api/trip/submit')
          .send(invalidTripData)
          .expect(400);

        expect(response.body.status).toBe(false);
        expect(typeof response.body.message).toBe('string');
      });
    });

    describe('GET /api/trip/get/:tripID', () => {
      it('should return trip details successfully', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/trip/get/${createdTripId}`)
          .expect(200);

        expect(response.body.status).toBe(true);
        expect(response.body.data).toHaveProperty('tripID', createdTripId);
        expect(response.body.data).toHaveProperty('customer');
        expect(response.body.data).toHaveProperty('vendor');
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trip/get/683aa0bd-5014-8010-920d-2e287f509338')
          .expect(404);

        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'trip with ID 683aa0bd-5014-8010-920d-2e287f509338 not found',
        );
      });
    });

    describe('GET /api/trip', () => {
      it('should return all trips', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trip')
          .expect(200);

        expect(response.body.status).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/trip/customer/:phoneNumber', () => {
      it('should return customer details by phone number', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/trip/customerSearch/${testCustomer.phoneNumbers[0]}`)
          .expect(200);

        expect(response.body.status).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('customerID');
      });

      it('should return 404 for non-existent phone number', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trip/customerSearch/+1234567890')
          .expect(404);

        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'Customer with phone number +1234567890 not found',
        );
      });
    });

    describe('POST /api/trip/sendLocation', () => {
      it('should return 404 for non-existent driver', async () => {
        const locationData = {
          driverID: '683aa0bd-5014-8010-920d-2e287f509338',
          location: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
          },
        };

        const response = await request(app.getHttpServer())
          .post('/api/trip/sendLocation')
          .send(locationData)
          .expect(404);

        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'Driver with ID 683aa0bd-5014-8010-920d-2e287f509338 not exist',
        );
      });
    });

    describe('DELETE /api/trip/:tripID', () => {
      it('should delete trip successfully', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/trip/${createdTripId}`)
          .expect(200);

        expect(response.body.status).toBe(true);
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app.getHttpServer())
          .delete('/api/trip/683aa0bd-5014-8010-920d-2e287f509338')
          .expect(404);

        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe(
          'Trip with ID 683aa0bd-5014-8010-920d-2e287f509338 not found',
        );
      });
    });
  });
});
