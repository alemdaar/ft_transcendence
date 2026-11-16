import { readDemo, saveDemo } from "./store";
import { mockUser } from "./data";

export function activityAction(path, method, body) {
  const data = readDemo();
  if (path.endsWith("/mine"))
    return {
      succes: data.requests.filter((item) => item.asker_id === mockUser.id),
    };
  if (path.endsWith("/iclaimed"))
    return {
      succes: data.requests.filter((item) => item.helper_id === mockUser.id),
    };
  const id = Number(path.split("/").pop());
  const post = data.requests.find((item) => item.id === id);
  if (!post) throw new Error("Request not found.");
  if (path.startsWith("/sessions/")) {
    if (![post.asker_id, post.helper_id].includes(mockUser.id))
      throw new Error("You are not a participant in this session.");
    return {
      succes: { ...post, meetup: post.meetup || null },
      Profiles: {
        askerOne: {
          id: String(post.asker_id),
          name:
            post.asker_id === mockUser.id ? mockUser.displayname : "Student",
        },
        helperOne: post.helper_id
          ? {
              id: String(post.helper_id),
              name:
                post.helper_id === mockUser.id
                  ? mockUser.displayname
                  : "Helper",
            }
          : null,
      },
    };
  }
  if (post.asker_id !== mockUser.id)
    throw new Error("Only the author can change this request.");
  if (method === "PATCH")
    Object.assign(post, body, { updated_at: new Date().toISOString() });
  if (method === "DELETE")
    data.requests = data.requests.filter((item) => item.id !== id);
  saveDemo(data);
  return { succes: post };
}
