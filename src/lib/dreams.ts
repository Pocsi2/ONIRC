export type Dream = {
  id: string;
  date: string;
  title: string;
  summary: string;
  body: string;
  feeling: string;
  place: string;
  hue: "cyan" | "lavender" | "blush" | "mint" | "champagne";
};

export const dreams: Dream[] = [
  {
    id: "glass-tide",
    date: "2026-08-03",
    title: "The Glass Tide",
    summary: "A shoreline arrived indoors and left tiny shells inside every drawer.",
    body: "I was standing in an apartment I almost recognized. The floor was a shallow sea, perfectly clear, with moonlight moving through it like curtains. When I opened the drawers, each one contained a small shell humming with someone else’s voice. I remember feeling that the room was trying to teach me how to listen without asking questions.",
    feeling: "tender unease",
    place: "an apartment by an impossible shore",
    hue: "cyan",
  },
  {
    id: "orchard-elevator",
    date: "2026-08-07",
    title: "The Orchard Elevator",
    summary: "An elevator opened into branches, silver fruit, and a rain that fell upward.",
    body: "The elevator had no buttons, only a bowl of silver fruit. Every time I picked one up, the doors opened to a different height inside the same orchard. Rain lifted from the grass into the clouds. Someone laughed from very far away, and I knew I had promised to meet them there before I had a name.",
    feeling: "bright longing",
    place: "a vertical orchard",
    hue: "mint",
  },
  {
    id: "library-of-fog",
    date: "2026-08-12",
    title: "Library of Fog",
    summary: "Books with blank pages exhaled weather when touched.",
    body: "The library was built without walls. Shelves stood in a field of fog, and each book opened into weather: a page of rain, a page of heat, a page of blue morning. I found a book with my childhood handwriting inside, but the words kept turning into small moths before I could read them.",
    feeling: "soft bewilderment",
    place: "a library with no edges",
    hue: "lavender",
  },
  {
    id: "pink-station",
    date: "2026-08-12",
    title: "The Pink Station",
    summary: "A train platform drifted quietly above the city at dawn.",
    body: "Everyone on the platform whispered as if the train were sleeping. The sky was the color of the inside of a shell. I had one ticket in my pocket, blank except for a pressed flower, and I understood that the destination would appear only after I stopped checking.",
    feeling: "patient wonder",
    place: "a floating station",
    hue: "blush",
  },
  {
    id: "porcelain-deer",
    date: "2026-08-18",
    title: "Porcelain Deer",
    summary: "A deer made of porcelain led me through a museum of rooms I had forgotten.",
    body: "Its hooves made no sound. The museum labels described emotions instead of objects: first embarrassment, first courage, the afternoon I learned to swim. The deer turned its head whenever I tried to hurry. By the final room, I had become careful enough to see the door home.",
    feeling: "reverence",
    place: "a museum of remembered rooms",
    hue: "champagne",
  },
  {
    id: "moon-kitchen",
    date: "2026-08-25",
    title: "Moon Kitchen",
    summary: "Someone cooked breakfast in a kitchen lit by three small moons.",
    body: "There were three moons outside the window, each low and round like lanterns. Someone I trusted but could not see was making tea. Steam formed little staircases above the cups. I woke before drinking anything, carrying the feeling of being expected somewhere kind.",
    feeling: "quiet safety",
    place: "a kitchen before sunrise",
    hue: "blush",
  },
];

export const visualSavedDream: Dream = {
  id: "white-garden",
  date: "2026-08-28",
  title: "The White Garden",
  summary: "A white garden opened into small rooms, each one holding a different morning.",
  body: "I was walking through a white garden where every flower opened into a small room. Inside one was a table set for breakfast, inside another a rainstorm falling upward, and inside the smallest room a mirror that reflected the sky instead of my face.",
  feeling: "newly kept",
  place: "a garden made of rooms",
  hue: "champagne",
};

export const featuredDream = dreams[2];

export function getDreamById(id: string) {
  return [...dreams, visualSavedDream].find((dream) => dream.id === id);
}

export function dreamsByDay(source: Dream[] = dreams) {
  return source.reduce<Record<number, Dream[]>>((acc, dream) => {
    const day = Number(dream.date.slice(-2));
    acc[day] = [...(acc[day] ?? []), dream];
    return acc;
  }, {});
}

export function formatDreamDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function shortDreamDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
