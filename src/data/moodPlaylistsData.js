// src/data/moodPlaylistsData.js


// Yahan pe sirf structure important hai.
// IDs, image URLs, description/mood tu apne hisaab se change kar lena.

export const moodPlaylists = [
  {
    id: "158221835", // JioSaavn playlist id (example)
    name: "Best Of Sad Songs",
    description: "Popular Heartbreak Hits",
    moodTag: "Sad · Heartbreak",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/BestOfSadSongsHindi_20240627124807.jpg?bch=1762945491",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/BestOfSadSongsHindi_20240627124807.jpg?bch=1762945491",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/BestOfSadSongsHindi_20240627124807.jpg?bch=1762945491",
      },
    ],
  },

  {
    id: "932189657",
    name: "Best Of Dance",
    description: "The Best Of Dance Music",
    moodTag: "Dance · Party",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/BestOfDanceHindi_20251125093505.jpg?bch=1764065118",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/BestOfDanceHindi_20251125093505.jpg?bch=1764065118",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/BestOfDanceHindi_20251125093505.jpg?bch=1764065118",
      },
    ],
  },

  {
    id: "903166403",
    name: "Best Of Romance",
    description: "Evergreen romantic hits for late nights",
    moodTag: "Romantic · Bollywood",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/BestOfRomanceHindi_20251125041820.jpg?bch=1764046113",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/BestOfRomanceHindi_20251125041820.jpg?bch=1764046113",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/BestOfRomanceHindi_20251125041820.jpg?bch=1764046113",
      },
    ],
  },

    id: "156710699",
    name: "Bollywood Rock - Workout Mix",
    description: "Have A Rocking Workout Session",
    moodTag: "Workout · Gym",
    image: [
      {
        quality: "50x50",
        url: "https://c.saavncdn.com/editorial/BollywoodRockWorkoutMix_20240229050234.jpg?bch=1762945965",
      },
      {
        quality: "150x150",
        url: "https://c.saavncdn.com/editorial/BollywoodRockWorkoutMix_20240229050234.jpg?bch=1762945965",
      },
      {
        quality: "500x500",
        url: "https://c.saavncdn.com/editorial/BollywoodRockWorkoutMix_20240229050234.jpg?bch=1762945965",
      },
    ],
  },
  // aur bhi moods yahan add kar sakta hai:
  // { id, name, description, moodTag, image: [...] }
];
