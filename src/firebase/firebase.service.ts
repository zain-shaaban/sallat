import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { logger } from 'src/common/error_logger/logger.util';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseAdmin: admin.app.App;

  onModuleInit() {
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
        return { status: false, message: error.message };
      }
    } else {
      this.firebaseAdmin = admin.app();
    }
  }

  get auth(): admin.auth.Auth {
    return this.firebaseAdmin.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.firebaseAdmin.firestore();
  }

  get messaging(): admin.messaging.Messaging {
    return this.firebaseAdmin.messaging();
  }
}
