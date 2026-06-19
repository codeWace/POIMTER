export async function getMarketData(query: string) {
  // TEMP STUBS (we will upgrade to real APIs next step)

  const googleTrends = {
    interest: Math.random() * 0.8 + 0.2
  };

  const reddit = {
    sentiment: (Math.random() * 2) - 1,
    volume: Math.random()
  };

  const news = {
    spike: Math.random() > 0.7
  };

  const instagram = {
  buzz: Math.random(),
  sentiment: (Math.random() * 2) - 1
};

const x = {
  buzz: Math.random(),
  sentiment: (Math.random() * 2) - 1
};

const facebook = {
  buzz: Math.random(),
  sentiment: (Math.random() * 2) - 1
};

  return {
  query,

  googleTrends,
  reddit,
  news,

  social: {
    instagram,
    x,
    facebook
  }
};
}