import { authorizedFetch } from './authorizedFetch';
import { studyMockEnabled } from '../mocks/study-request/config';
import { studyTestTokenEnabled } from '../mocks/study-token/config';

export async function studyFetch(path, options = {}) {
  if (studyMockEnabled) {
    const { mockStudyFetch } = await import('../mocks/study-request/api.js');
    return mockStudyFetch(path, options);
  }
  if (studyTestTokenEnabled) {
    const { studyTestTokenFetch } = await import('../mocks/study-token/fetch.js');
    return studyTestTokenFetch(path, options);
  }
  return authorizedFetch(path, options);
}
