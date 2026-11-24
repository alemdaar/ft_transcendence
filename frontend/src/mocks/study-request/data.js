const date = '2026-11-24T10:00:00.000Z';
const post = (id, asker_id, helper_id, topic, mode, status, campus = 'Rabat') => ({
  id, asker_id, helper_id, topic, description: 'A sample study request for testing the complete study workflow.', mode, status, campus, created_at: date, updated_at: date, meetup: null,
});
export const studyProfiles = {
  1: { id: '1', name: 'Student One', avatar: null },
  2: { id: '2', name: 'Student Two', avatar: null },
};
export const initialStudyRequests = [
  post(101, 1, null, 'My React question', 'online', 'open'),
  post(102, 2, null, 'Help with C pointers', 'online', 'open', 'Med'),
  post(103, 2, null, 'Minishell study meetup', 'insite', 'open'),
  post(104, 2, 1, 'Online session I claimed', 'online', 'claimed', 'Khouribga'),
  { ...post(105, 1, 2, 'Library meetup', 'insite', 'pending'), meetup: { id: 38, request_id: 105, specificSpot: 'In the library', meetTime: '1970-01-01T12:00:00.000Z', asker_on_way: false, asker_arrived: false, helper_on_way: true, helper_arrived: false, created_at: date } },
  post(106, 1, 999, 'Session with unavailable user', 'online', 'claimed'),
  post(107, 2, null, 'Algorithms review', 'online', 'open', 'Ben guerir'),
];
