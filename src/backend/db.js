import { getDb } from './mongodb';

export async function getUsersCol() {
  const db = await getDb();
  return db.collection('users');
}

export async function getCompaniesCol() {
  const db = await getDb();
  return db.collection('companies');
}

export async function getProjectsCol() {
  const db = await getDb();
  return db.collection('projects');
}

export async function getStoriesCol() {
  const db = await getDb();
  return db.collection('stories');
}

export async function getTasksCol() {
  const db = await getDb();
  return db.collection('tasks');
}

export async function getWorkflowSettingsCol() {
  const db = await getDb();
  return db.collection('workflow_settings');
}

