import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { logger } from 'src/common/error_logger/logger.util';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseAdmin: admin.app.App;

  async onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (!serviceAccountEnv) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT environment variable is not set',
        );
      }

      try {
        const serviceAccount = JSON.parse(serviceAccountEnv);

        this.firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });
      } catch (error) {
        logger.error(error.message, error.stack);
        throw new Error(`Firebase initialization failed: ${error.message}`);
      }
    } else {
      this.firebaseAdmin = admin.app();
    }
  }

  messaging(): admin.messaging.Messaging {
    if (!this.firebaseAdmin) {
      logger.error('Firebase Admin is not initialized','src/firebase/firebase.service.ts_38')
      throw new Error('Firebase Admin is not initialized');
    }
    return this.firebaseAdmin.messaging();
  }
}
