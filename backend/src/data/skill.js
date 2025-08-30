// プログラミング言語
const programmingLanguages = [
  { id: 1, name: "JavaScript", category: "プログラミング言語" },
  { id: 2, name: "TypeScript", category: "プログラミング言語" },
  { id: 3, name: "Python", category: "プログラミング言語" },
  { id: 4, name: "Java", category: "プログラミング言語" },
  { id: 5, name: "C", category: "プログラミング言語" },
  { id: 6, name: "C++", category: "プログラミング言語" },
  { id: 7, name: "C#", category: "プログラミング言語" },
  { id: 8, name: "PHP", category: "プログラミング言語" },
  { id: 9, name: "Ruby", category: "プログラミング言語" },
  { id: 10, name: "Go", category: "プログラミング言語" },
  { id: 11, name: "Rust", category: "プログラミング言語" },
  { id: 12, name: "Swift", category: "プログラミング言語" },
  { id: 13, name: "Kotlin", category: "プログラミング言語" },
  { id: 14, name: "Scala", category: "プログラミング言語" },
  { id: 15, name: "R", category: "プログラミング言語" },
  { id: 16, name: "MATLAB", category: "プログラミング言語" },
  { id: 17, name: "Shell Script", category: "プログラミング言語" },
  { id: 18, name: "PowerShell", category: "プログラミング言語" },
];

// フロントエンドフレームワーク
const frontendFrameworks = [
  { id: 101, name: "React", category: "フロントエンドフレームワーク" },
  { id: 102, name: "Vue.js", category: "フロントエンドフレームワーク" },
  { id: 103, name: "Angular", category: "フロントエンドフレームワーク" },
  { id: 104, name: "Next.js", category: "フロントエンドフレームワーク" },
  { id: 105, name: "Nuxt.js", category: "フロントエンドフレームワーク" },
  { id: 106, name: "Svelte", category: "フロントエンドフレームワーク" },
  { id: 107, name: "SvelteKit", category: "フロントエンドフレームワーク" },
  { id: 108, name: "Gatsby", category: "フロントエンドフレームワーク" },
  { id: 109, name: "Remix", category: "フロントエンドフレームワーク" },
];

// バックエンドフレームワーク
const backendFrameworks = [
  { id: 201, name: "Node.js", category: "バックエンドフレームワーク" },
  { id: 202, name: "Express.js", category: "バックエンドフレームワーク" },
  { id: 203, name: "Django", category: "バックエンドフレームワーク" },
  { id: 204, name: "Flask", category: "バックエンドフレームワーク" },
  { id: 205, name: "FastAPI", category: "バックエンドフレームワーク" },
  { id: 206, name: "Spring Boot", category: "バックエンドフレームワーク" },
  { id: 207, name: "Laravel", category: "バックエンドフレームワーク" },
  { id: 208, name: "Ruby on Rails", category: "バックエンドフレームワーク" },
  { id: 209, name: "ASP.NET Core", category: "バックエンドフレームワーク" },
  { id: 210, name: "Gin", category: "バックエンドフレームワーク" },
  { id: 211, name: "Echo", category: "バックエンドフレームワーク" },
];

// データベース
const databases = [
  { id: 301, name: "MySQL", category: "データベース" },
  { id: 302, name: "PostgreSQL", category: "データベース" },
  { id: 303, name: "MongoDB", category: "データベース" },
  { id: 304, name: "Redis", category: "データベース" },
  { id: 305, name: "SQLite", category: "データベース" },
  { id: 306, name: "Oracle Database", category: "データベース" },
  { id: 307, name: "SQL Server", category: "データベース" },
  { id: 308, name: "DynamoDB", category: "データベース" },
  { id: 309, name: "Cassandra", category: "データベース" },
  { id: 310, name: "Elasticsearch", category: "データベース" },
];

// クラウド・インフラ
const cloudInfra = [
  { id: 401, name: "AWS", category: "クラウド" },
  { id: 402, name: "Google Cloud Platform", category: "クラウド" },
  { id: 403, name: "Microsoft Azure", category: "クラウド" },
  { id: 404, name: "Docker", category: "インフラ" },
  { id: 405, name: "Kubernetes", category: "インフラ" },
  { id: 406, name: "Terraform", category: "インフラ" },
  { id: 407, name: "Ansible", category: "インフラ" },
  { id: 408, name: "Jenkins", category: "CI/CD" },
  { id: 409, name: "GitHub Actions", category: "CI/CD" },
  { id: 410, name: "GitLab CI", category: "CI/CD" },
  { id: 411, name: "CircleCI", category: "CI/CD" },
  { id: 412, name: "Nginx", category: "Webサーバー" },
  { id: 413, name: "Apache", category: "Webサーバー" },
];

// OS・ツール
const osTools = [
  { id: 501, name: "Linux", category: "OS" },
  { id: 502, name: "Windows", category: "OS" },
  { id: 503, name: "macOS", category: "OS" },
  { id: 504, name: "Git", category: "バージョン管理" },
  { id: 505, name: "SVN", category: "バージョン管理" },
  { id: 506, name: "Mercurial", category: "バージョン管理" },
  { id: 507, name: "Vim", category: "エディタ" },
  { id: 508, name: "Visual Studio Code", category: "エディタ" },
  { id: 509, name: "IntelliJ IDEA", category: "エディタ" },
  { id: 510, name: "Eclipse", category: "エディタ" },
];

// データサイエンス・AI
const dataScienceAI = [
  { id: 601, name: "TensorFlow", category: "機械学習" },
  { id: 602, name: "PyTorch", category: "機械学習" },
  { id: 603, name: "scikit-learn", category: "機械学習" },
  { id: 604, name: "Pandas", category: "データ分析" },
  { id: 605, name: "NumPy", category: "データ分析" },
  { id: 606, name: "Matplotlib", category: "データ可視化" },
  { id: 607, name: "Seaborn", category: "データ可視化" },
  { id: 608, name: "Plotly", category: "データ可視化" },
  { id: 609, name: "Jupyter Notebook", category: "データ分析" },
  { id: 610, name: "Apache Spark", category: "ビッグデータ" },
  { id: 611, name: "Hadoop", category: "ビッグデータ" },
];

// モバイル開発
const mobileDevelopment = [
  { id: 701, name: "React Native", category: "モバイル開発" },
  { id: 702, name: "Flutter", category: "モバイル開発" },
  { id: 703, name: "Xamarin", category: "モバイル開発" },
  { id: 704, name: "Ionic", category: "モバイル開発" },
  { id: 705, name: "Android SDK", category: "モバイル開発" },
  { id: 706, name: "iOS SDK", category: "モバイル開発" },
];

// デザイン・UI/UX
const designTools = [
  { id: 801, name: "Figma", category: "デザインツール" },
  { id: 802, name: "Adobe XD", category: "デザインツール" },
  { id: 803, name: "Sketch", category: "デザインツール" },
  { id: 804, name: "Adobe Photoshop", category: "デザインツール" },
  { id: 805, name: "Adobe Illustrator", category: "デザインツール" },
  { id: 806, name: "Canva", category: "デザインツール" },
  { id: 807, name: "Tailwind CSS", category: "CSS" },
  { id: 808, name: "Bootstrap", category: "CSS" },
  { id: 809, name: "Sass/SCSS", category: "CSS" },
  { id: 810, name: "Material-UI", category: "CSS" },
];

// ゲーム開発
const gameDevelopment = [
  { id: 901, name: "Unity", category: "ゲーム開発" },
  { id: 902, name: "Unreal Engine", category: "ゲーム開発" },
  { id: 903, name: "Godot", category: "ゲーム開発" },
  { id: 904, name: "Blender", category: "3Dモデリング" },
  { id: 905, name: "Maya", category: "3Dモデリング" },
  { id: 906, name: "3ds Max", category: "3Dモデリング" },
];

// その他・専門分野
const others = [
  { id: 1001, name: "GraphQL", category: "API" },
  { id: 1002, name: "REST API", category: "API" },
  { id: 1003, name: "gRPC", category: "API" },
  { id: 1004, name: "WebSocket", category: "通信" },
  { id: 1005, name: "Socket.io", category: "通信" },
  { id: 1006, name: "Firebase", category: "BaaS" },
  { id: 1007, name: "Supabase", category: "BaaS" },
  { id: 1008, name: "Strapi", category: "CMS" },
  { id: 1009, name: "WordPress", category: "CMS" },
  { id: 1010, name: "Shopify", category: "Eコマース" },
];

// 全スキルを統合
const allSkills = [
  ...programmingLanguages,
  ...frontendFrameworks,
  ...backendFrameworks,
  ...databases,
  ...cloudInfra,
  ...osTools,
  ...dataScienceAI,
  ...mobileDevelopment,
  ...designTools,
  ...gameDevelopment,
  ...others,
];

export default allSkills;
