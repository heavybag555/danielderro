export const SITE_ABOUT_COPY =
  "Daniel Derro creates visual narratives for luxury fashion and cultural brands, bringing authentic street perspective to premium campaigns. His work for Prada, Dior, and Givenchy demonstrates his ability to translate genuine cultural moments into compelling luxury brand stories.";

export const INFO_ABOUT = [
  SITE_ABOUT_COPY,
  "His artistic practice centers on social connection and community engagement, including work within correctional facilities and youth mentorship programs. This depth of human experience brings genuine authenticity to commercial work, creating campaigns that resonate beyond surface aesthetics.",
] as const;

export const SITE_CLIENTS_COPY =
  "Prada, Nike, Givenchy, Dior, Stüssy, Adidas, pgLang, Burberry, Carhartt WIP, Our Legacy, New Balance, Fake Mink, ASICS, Moncler, T Magazine, Giveon, Popeye, Stormzy, Yeezy, Slam Jam, Converse, Alo, Nike Golf, Crash, Jordan, Union, Dazed, Babylon, Neighborhood, Saint Laurent, Kaleidoscope, i-D, Interview Magazine";

export const SITE_CLIENTS = SITE_CLIENTS_COPY.split(", ");

export const INFO_SERVICES = [
  {
    title: "Creative Direction",
    items: [
      "Concept Development",
      "Campaign Integration",
      "Brand Consulting",
      "Release Strategy",
    ],
  },
  {
    title: "Photography",
    items: [
      "Medium Format Film",
      "High-End Digital Capture",
      "Editorial",
      "Campaign",
    ],
  },
  {
    title: "Film Direction",
    items: [
      "Campaign Film",
      "Album Visuals",
      "Music Industry Collaborations",
      "Documentary",
    ],
  },
  {
    title: "Production",
    items: [
      "Casting",
      "Location Scouting",
      "Full Creative Delivery",
      "Concept through Final",
    ],
  },
] as const;

/** Second hero portrait — sits in the home hero logo strip (first image is the background fill). */
export const HERO_STACK_PORTRAIT = {
  src: "/images/debt-ss-105.jpg",
  alt: "Daniel Derro",
  width: 4083,
  height: 3000,
} as const;

export type RadioTrack = {
  artist: string;
  title: string;
};

export type RadioEpisode = {
  id: string;
  title: string;
  mixcloudUrl: string;
  cover: { src: string; alt: string; width: number; height: number };
  description: string;
  tracklist: readonly RadioTrack[];
  /** Fallback total duration before Mixcloud metadata loads. */
  durationLabel?: string;
};

const IDENTITY_CORRECTION_COVER = {
  src: "https://thumbnailer.mixcloud.com/unsafe/600x600/profile/0/f/9/2/f7c0-3015-41a3-877b-eea12082ffdc",
  alt: "Identity Correction Radio",
  width: 600,
  height: 600,
} as const;

export const RADIO_INTRO = {
  title: "Identity Correction Radio",
  description:
    "A research based project cataloging rare and important music. Artists that challenged our understanding of morality and sanity, exploring the complexities and absurdity of human existence.",
} as const;

export const RADIO_INTRO_IMAGES = [
  {
    src: "/images/radio/radio-dublin-stamp.png",
    alt: "Radio Dublin",
    width: 851,
    height: 1024,
  },
  {
    src: "/images/radio/identity-correction-radio-logo.png",
    alt: "Identity Correction Radio — More Music – Less Talk",
    width: 1024,
    height: 220,
  },
] as const;

export const RADIO_EPISODES: RadioEpisode[] = [
  {
    id: "01",
    title: "Identity Correction Radio - Ep 1",
    mixcloudUrl: "https://www.mixcloud.com/frankradio/no-school-ep-1/",
    cover: IDENTITY_CORRECTION_COVER,
    description: "Identity Correction Radio — episode one.",
    tracklist: [
      { artist: "Stefan Ringer", title: "Love 2u" },
      { artist: "Patrice Rushen", title: "To each his own" },
      { artist: "Otis g Johnson", title: "Walk with Jesus" },
      { artist: "Cody Chestnutt", title: "Do better to the Young" },
      { artist: "George Smallwood", title: "I love my father" },
      { artist: "Kieth Mansfield", title: "Before Summer Ends" },
      { artist: "Kashif", title: "Stone Love (instrumental)" },
      { artist: "Cvarteful de Jazz Paul Weiner", title: "Căutǎrti" },
      { artist: "One Way", title: "Guess You Didn’t Know" },
      { artist: "The Festivals", title: "You’ve got the Makings of a Lover" },
      { artist: "Whole Truth", title: "Can you Love by Following God" },
      { artist: "Donny Hathaway", title: "Make it Your own" },
      { artist: "J.O.B. Orchestra", title: "Only Faith and Hope" },
    ],
    durationLabel: "60:33",
  },
  {
    id: "02",
    title: "Identity Correction Radio",
    mixcloudUrl: "https://www.mixcloud.com/frankradio/identity-correction-radio/",
    cover: IDENTITY_CORRECTION_COVER,
    description: "Identity Correction Radio.",
    tracklist: [
      { artist: "Liv.E", title: "I Been Livin" },
      { artist: "Hanna", title: "I Needed" },
      { artist: "Dwight Sykes", title: "Where Ever You Are" },
      { artist: "Alexander Spit", title: "RUN (set it off)" },
      { artist: "Jawnino", title: "2trains" },
      { artist: "Oko Ebombo", title: "Cop Killer" },
      { artist: "Rue Jacobs", title: "2 much vapor (feat. Aaron Longsleeves)" },
      { artist: "Vegyn", title: "Big Shoes Big Hands V3" },
      { artist: "Jay Prince", title: "Good Right Now" },
      { artist: "Fredwave", title: "99" },
      {
        artist: "chaz La Pointe",
        title: "the Sound is Diminished, the Fury subsides/ trenchfoot",
      },
      { artist: "Gyeongsu", title: "Gratitude" },
      { artist: "Cities Aviv", title: "But Did You Love Me" },
      { artist: "Mark william Lewis", title: "Life with Life" },
      { artist: "Shlohmo", title: "Beams" },
      { artist: "Babyfather", title: "Sleep it Off" },
      { artist: "Wilfy D", title: "Like This" },
      { artist: "Nguzunguzu", title: "Just a Touch" },
    ],
    durationLabel: "58:57",
  },
];

export const HERO_LOGOS = [
  {
    src: "/images/hero/logo-no-school-crime-wave.png",
    alt: "No School Crime Wave",
    width: 370,
    height: 370,
  },
  { src: "/images/hero/logo-eagle.png", alt: "Eagle", width: 442, height: 566 },
  { src: "/images/hero/logo-most-wanted.png", alt: "Most Wanted", width: 566, height: 138 },
  {
    src: "/images/hero/logo-injuring-eternity.png",
    alt: "Injuring Eternity",
    width: 453,
    height: 1024,
  },
  { src: "/images/hero/logo-no-cry-babys.png", alt: "No Cry Baby's", width: 650, height: 138 },
  { src: "/images/hero/logo-radio.png", alt: "Radio", width: 851, height: 1024 },
] as const;
