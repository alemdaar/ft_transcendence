import { studyMockEnabled } from './config';
import { resetStudyData, studyUserId } from './store';

export default function StudyDemoControls() {
  if (!studyMockEnabled) return null;
  function changeUser(event) { sessionStorage.setItem('study-demo-user', event.target.value); window.location.assign('/study-request'); }
  function reset() { resetStudyData(); window.location.assign('/study-request'); }
  return <div className="flex flex-wrap items-center gap-3 rounded-xl border border-success-line bg-selected p-3 text-xs text-highlight">
    <span>Study Request demo · No backend required</span>
    <label className="flex items-center gap-2">Test user<select aria-label="Study demo user" defaultValue={String(studyUserId())} onChange={changeUser} className="rounded border border-line bg-surface px-2 py-1 text-fg"><option value="1">Student One</option><option value="2">Student Two</option></select></label>
    <button type="button" onClick={reset} className="rounded px-2 py-1 font-semibold underline">Reset study data</button>
  </div>;
}
