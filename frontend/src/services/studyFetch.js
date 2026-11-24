import { authorizedFetch } from './authorizedFetch';
import { studyMockEnabled } from '../mocks/study-request/config';

export async function studyFetch(path, options = {}) {
  if (studyMockEnabled) {
    const { mockStudyFetch } = await import('../mocks/study-request/api.js');
    return mockStudyFetch(path, options);
  }
  return authorizedFetch(path, options);
}
