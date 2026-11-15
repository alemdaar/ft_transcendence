import { mockUser } from "./data";
import { readDemo, saveDemo } from "./store";

function present(group) {
  const { members, pending, ...details } = group;
  return {
    ...details,
    isOwner: group.ownerId === mockUser.id,
    _count: { members: members.length },
    hasPendingRequest: pending.includes(mockUser.id),
  };
}
function findGroup(data, id) {
  const group = data.groups.find((group) => group.id === Number(id));
  if (!group) throw new Error("Group not found.");
  if (group.type === "team" && group.campus !== mockUser.campus)
    throw new Error("This team belongs to a different campus.");
  return group;
}
export function listGroups({
  scope,
  page = 1,
  type = "",
  search = "",
  sort = "",
}) {
  let groups = readDemo().groups.filter((group) => {
    if (scope === "mine") return group.members.includes(mockUser.id);
    if (scope === "pending") return group.pending.includes(mockUser.id);
    return (
      !group.members.includes(mockUser.id) &&
      !group.pending.includes(mockUser.id) &&
      (group.type === "general" || group.campus === mockUser.campus)
    );
  });
  if (scope === "discover")
    groups = groups.filter(
      (group) =>
        (!type || group.type === type) &&
        group.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  groups.sort(
    (a, b) =>
      (Date.parse(a.createdAt) - Date.parse(b.createdAt)) *
      (scope === "discover" && sort === "oldest" ? 1 : -1),
  );
  const limit = 4;
  const totalPages = Math.ceil(groups.length / limit);
  const currentPage = Math.max(1, Math.min(Number(page) || 1, totalPages || 1));
  return {
    data: groups
      .slice((currentPage - 1) * limit, currentPage * limit)
      .map(present),
    pagination: {
      currentPage,
      limit,
      totalGroups: groups.length,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
}
export function createDemoGroup(input) {
  const data = readDemo();
  const group = {
    ...input,
    id: Math.max(0, ...data.groups.map((group) => group.id)) + 1,
    campus: mockUser.campus,
    ownerId: mockUser.id,
    memberLimit: input.type === "team" ? input.memberLimit : null,
    createdAt: new Date().toISOString(),
    members: [mockUser.id],
    pending: [],
  };
  data.groups.push(group);
  saveDemo(data);
  return { message: "Group created.", group: present(group) };
}
export function groupAction(id, method, suffix) {
  const data = readDemo();
  const group = findGroup(data, id);
  if (method === "GET") return present(group);
  if (method === "DELETE") {
    if (group.ownerId !== mockUser.id)
      throw new Error("Only the owner can delete this group.");
    data.groups = data.groups.filter((item) => item.id !== group.id);
    saveDemo(data);
    return { message: "group deleted", deletedGroup: present(group) };
  }
  if (group.members.includes(mockUser.id))
    throw new Error("You are already a member.");
  if (suffix === "/join") {
    if (group.type !== "general")
      throw new Error("Team groups require a join request.");
    group.members.push(mockUser.id);
    saveDemo(data);
    return { message: "Successfully joined the group." };
  }
  if (suffix === "/join-request") {
    if (group.type !== "team")
      throw new Error("General groups can be joined directly.");
    if (group.pending.includes(mockUser.id))
      throw new Error("You already have a pending request.");
    if (group.members.length >= group.memberLimit)
      throw new Error("This team is full.");
    group.pending.push(mockUser.id);
    saveDemo(data);
    return {
      message: "Join request sent successfully. Waiting for owner approval.",
    };
  }
  throw new Error("Unsupported demo action.");
}
