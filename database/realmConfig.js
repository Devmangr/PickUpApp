import Realm from 'realm';
import { TempSetSchema, TempItemSchema } from './realmSchema';

export const REPO_SCHEMA = [TempSetSchema, TempItemSchema];
export const getRealm = async () => {
  return Realm.open({ schema: REPO_SCHEMA, schemaVersion: 1, deleteRealmIfMigrationNeeded: true, });
};