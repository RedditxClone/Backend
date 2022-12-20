export const users = [
  {
    username: 'user1',
    email: 'user1@example.com',
    password: '12345678',
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: '12345678',
  },
  {
    username: 'user3',
    email: 'user3@example.com',
    password: '12345678',
  },
  {
    username: 'user4',
    email: 'user4@example.com',
    password: '12345678',
  },
  {
    username: 'user5',
    email: 'user5@example.com',
    password: '12345678',
  },
];

export const subreddits = [
  {
    username: 'user2',
    data: {
      name: 'srfirst',
      type: 'public',
      over18: false,
    },
  },
  {
    username: 'user2',
    data: {
      name: 'srsecond',
      type: 'public',
      over18: false,
    },
  },
  {
    username: 'user3',
    data: {
      name: 'srthird',
      type: 'public',
      over18: false,
    },
  },

  {
    username: 'user5',
    data: {
      name: 'srfourth',
      type: 'public',
      over18: false,
    },
  },
];

export const joins = [
  {
    username: 'user5',
    subreddit: 'srfirst',
  },

  {
    username: 'user4',
    subreddit: 'srfirst',
  },

  {
    username: 'user3',
    subreddit: 'srfirst',
  },

  {
    username: 'user1',
    subreddit: 'srfirst',
  },

  {
    username: 'user4',
    subreddit: 'srsecond',
  },

  {
    username: 'user3',
    subreddit: 'srsecond',
  },
];

export const posts = [
  {
    username: 'user5',
    subreddit: 'srfirst',
    data: {
      title: 'My first post in srfirst!',
      text: 'Hello everyone ^_^',
    },
  },

  {
    username: 'user1',
    subreddit: 'srfirst',
    data: {
      title: 'I like this subreddit',
      text: 'We should post alot more here',
    },
  },

  {
    username: 'user2',
    subreddit: 'srfirst',
    data: {
      title: 'Announcement: we are the most popular subreddit',
      text: 'We got seeded into being popular. Yay!',
    },
  },

  {
    username: 'user5',
    subreddit: 'srfourth',
    data: {
      title: 'Lonely',
      text: "It's so lonely here :(",
    },
  },

  {
    username: 'user5',
    subreddit: 'srsecond',
    data: {
      title: 'why',
      text: 'Why so many subreddits? /u/user2',
    },
  },
];
