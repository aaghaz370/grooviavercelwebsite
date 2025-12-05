// src/data/goldenEraData.js

// Ye sirf example hai – IDs / images tum JioSaavn se replace kar dena
export const goldenEraPlaylists = [
  {
    id: "101010101",                 // JioSaavn playlist id
    name: "Golden Era: 90s Romance",
    type: "playlist",
    tagLine: "90s Bollywood love hits",   // optional, UI me use kar sakte ho
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/...50x50.jpg",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/...150x150.jpg",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/...500x500.jpg",
      },
    ],
    songCount: 40,
    language: "hindi",
    explicitContent: false,
  },

  {
    id: "202020202",
    name: "Golden 80s Blockbusters",
    type: "playlist",
    tagLine: "Evergreen Bollywood 80s",
    image: [
      { quality: "50x50", url: "https://c.saavncdn.com/...50x50.jpg" },
      { quality: "150x150", url: "https://c.saavncdn.com/...150x150.jpg" },
      { quality: "500x500", url: "https://c.saavncdn.com/...500x500.jpg" },
    ],
    songCount: 35,
    language: "hindi",
    explicitContent: false,
  },

  // 👇 jitni chaho aise playlists add karte jao
];
