// 仮のデータベース
let users = [];
let nextId = 1;

export const dataStore = {
  // ユーザー情報
  getUser: () => users,
  addUser: (user) => {
    const newUser = { ...user, id: nextId++ };
    users.push(newUser);
    return newUser;
  },
  findUserById: (id) => users.find((user) => user.id === id),
  findUserByStudentId: (studentId) =>
    users.find((user) => user.studentId === studentId),
  updateUser: (id, updateData) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updateData };
    return users[userIndex];
  },

  getNextId: () => nextId,
  setNextId: (id) => {
    nextId = id;
  },
};
