export type WorkerEnv = {
  FIREBASE_PROJECT_ID: string;
  FIRESTORE_DATABASE_ID?: string;
  ALLOWED_ORIGINS: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
  MIGRATION_ADMIN_UIDS: string;
};

export type FirebaseIdentity = {
  uid: string;
  issuedAt: number;
  authTime: number;
};

export type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

export type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

export type FirestoreRead = {
  found?: FirestoreDocument;
  missing?: string;
};

export type FirestoreWrite = {
  update?: FirestoreDocument;
  delete?: string;
  updateMask?: { fieldPaths: string[] };
  currentDocument?: { exists?: boolean; updateTime?: string };
};
