// 仮のデータベース
let users = [];
let nextId = 1;

export const dataStore = {
  // ユーザー情報
  getUsers: () => users,
  addUser: (user) => {
    const newUser = {
      ...user,
      id: nextId++,
      // プロフィール情報
      profileImg: null,
      bio: "",
      github: "",
      sns: "",
      linkedinUrl: "",
      websiteUrl: "",
      portfolioUrl: "",
      interests: [],
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },
  findUserById: (id) => users.find((user) => user.id === id),
  findUserByStudentId: (studentId) =>
    users.find((user) => user.studentId === studentId),
  updateUser: (id, updateData) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return users[userIndex];
  },

  // プロフィール専用メソッド
  updateUserProfile: (id, profileData) => {
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    // プロフィール関連フィールドのみ更新
    const editedFields = [
      "profileImg",
      "bio",
      "github",
      "sns",
      "linkedinUrl",
      "websiteUrl",
      "portfolioUrl",
      "interests",
    ];

    // 指定されたフィールドのみを更新
    const filteredData = {};
    editedFields.forEach((field) => {
      if (profileData.hasOwnProperty(field)) {
        filteredData[field] = profileData[field];
      }
    });

    // 更新日時を設定
    users[userIndex] = {
      ...users[userIndex],
      ...filteredData,
      updatedAt: new Date().toISOString(),
    };
    return users[userIndex];
  },

  getNextId: () => nextId,
  setNextId: (id) => {
    nextId = id;
  },
};
