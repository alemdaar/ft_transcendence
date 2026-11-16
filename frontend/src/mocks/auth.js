import studentAvatar from './assets/student.svg';
import { mockUser } from "./data";

export function getDemoUser() {
  const intra = sessionStorage.getItem("studypeer-demo-account") === "42";
  return {
    ...mockUser,
    authProvider: intra ? "42" : "password",
    username: intra ? "intra_student" : "demo_student",
    avatarUrl: intra ? studentAvatar : null,
  };
}

export function mockAuthRequest(path, signal) {
  signal?.throwIfAborted();
  if (path === 'me') return { user: sessionStorage.getItem('studypeer-demo-signed-out') ? null : getDemoUser() };
  if (path === 'login') {
    sessionStorage.removeItem('studypeer-demo-signed-out');
    return { user: getDemoUser() };
  }
  if (path === 'logout') {
    sessionStorage.setItem('studypeer-demo-signed-out', 'true');
    return { message: 'Signed out of demo.' };
  }
  throw new Error('Registration and email verification are unavailable in demo mode.');
}
