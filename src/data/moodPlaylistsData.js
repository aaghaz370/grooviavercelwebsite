// src/data/moodPlaylistsData.js

// Yahan pe sirf structure important hai.
// IDs, image URLs, description/mood tu apne hisaab se change kar lena.

export const moodPlaylists = [
  {
    id: "158221835", // JioSaavn playlist id (example)
    name: "Dil Ka Sukoon",
    description: "Soft & calm tracks for peaceful nights",
    moodTag: "Sad · Lofi",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/FILTRDilKaSukoon_20241107054854_50x50.jpg",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/FILTRDilKaSukoon_20241107054854_150x150.jpg",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/FILTRDilKaSukoon_20241107054854_500x500.jpg",
      },
    ],
  },

  {
    id: "932189657",
    name: "Best Of Dance - Hindi",
    description: "High energy Bollywood bangers",
    moodTag: "Workout · Party",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/BestOfDanceHindi_20241121062228_50x50.jpg",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/BestOfDanceHindi_20241121062228_150x150.jpg",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/BestOfDanceHindi_20241121062228_500x500.jpg",
      },
    ],
  },

  {
    id: "903166403",
    name: "Best Of Romance - Hindi",
    description: "Evergreen romantic hits for late nights",
    moodTag: "Romantic · Classic",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/BestOfRomanceHindi_20250131090151_50x50.jpg",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/BestOfRomanceHindi_20250131090151_150x150.jpg",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/BestOfRomanceHindi_20250131090151_500x500.jpg",
      },
    ],
  },

  // aur bhi moods yahan add kar sakta hai:
  // { id, name, description, moodTag, image: [...] }
];
