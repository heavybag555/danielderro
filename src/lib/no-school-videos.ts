export type NoSchoolVideo = {
  id: string;
  title: string;
  vimeoUrl: string;
  duration: number;
  thumbnail: string;
  width: number;
  height: number;
  slug: string;
};

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `no-school-${id}`;
}

/** NO SCHOOL Vimeo channel catalog — tagged `no-school-studio` on the work page. */
const RAW = [
  {
    id: "1097286812",
    title: "Cold Time Prayer",
    duration: 122,
    thumbnail:
      "https://i.vimeocdn.com/video/2031588037-89df49feede8c80fd4fe0db10faf3687ecdf0b4bd2ab1fa2a79a8209aaabe0e9-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "1069114242",
    title: "Salomon Faye - Noah's Arc",
    duration: 178,
    thumbnail:
      "https://i.vimeocdn.com/video/1997381535-7331fd5b1e2df322fee35117e165d32069ab07c2c1a26c6adbb85336def5b30e-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "1069112664",
    title: "Slam Jam x Converse",
    duration: 37,
    thumbnail:
      "https://i.vimeocdn.com/video/1997369458-cea2b27b1743c714407e608f5b530b035b9d5088051ac8f280bd75e6663164c4-d_640?region=us",
    width: 1280,
    height: 720,
  },
  {
    id: "885684757",
    title: "CARHARTT WIP FW23",
    duration: 30,
    thumbnail:
      "https://i.vimeocdn.com/video/1755318877-40b81cde647591fd17cc24677929067e605f6b17dbde5f6a22a2e3e06340c3c1-d_640?region=us",
    width: 2048,
    height: 1500,
  },
  {
    id: "850698393",
    title: "SIDESHOW - HARDTOKILL",
    duration: 124,
    thumbnail:
      "https://i.vimeocdn.com/video/1705219357-e527a46a84717e355b6e9b2d1bcedc42ee81c6d2a6a187b2ed031293df1c28ed-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "816994735",
    title: "The Sum of Many : Trailer",
    duration: 176,
    thumbnail:
      "https://i.vimeocdn.com/video/1654323505-b3b3c1df987bf5687b20c923ed4c2c81d394b93f29f4a22913f9613345561eae-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "759952895",
    title: "'Committed Escape' introduction to LID",
    duration: 100,
    thumbnail:
      "https://i.vimeocdn.com/video/1526291014-e14a5874c5185e74a44f62c7bed4df5a67ba3f984bd47257bbcfbc370e2b88da-d_640?region=us",
    width: 980,
    height: 720,
  },
  {
    id: "727839587",
    title: "Adidas x Stella McCartney True Pace",
    duration: 46,
    thumbnail:
      "https://i.vimeocdn.com/video/1465481787-5590f6bfaf174b8861ad5133ebca960d979626c3f6f0b4b8b0d754e0ce6a50b2-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "719206361",
    title: "Stussy Surf (Director's Cut)",
    duration: 314,
    thumbnail:
      "https://i.vimeocdn.com/video/1583528227-3eb99b465edd15cc5d17eb8217d1661189be389e392b04e6027cdd0c95934f32-d_640?region=us",
    width: 980,
    height: 720,
  },
  {
    id: "632342509",
    title: "The Alchemist ft. Mavi - Miracle Baby",
    duration: 147,
    thumbnail:
      "https://i.vimeocdn.com/video/1274672984-894f1d8dc14d3eedf91d3c161d4594d92657ac904bc424822_640?region=us",
    width: 3840,
    height: 2160,
  },
  {
    id: "618229097",
    title: "Dickies x DAZED MEDIA",
    duration: 208,
    thumbnail:
      "https://i.vimeocdn.com/video/1260337658-b4e725308d71bd85a73a805b2a03c5fd1f12b0f8c7f211026_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "565771809",
    title: "Trinity County for The Elder Statesman SS21",
    duration: 117,
    thumbnail:
      "https://i.vimeocdn.com/video/1169909663-889c06d4ed7091f922804180cfb8fe2af988cf7dadb5ba3e4db6fffdf5130b5e-d_640?region=us",
    width: 1500,
    height: 1124,
  },
  {
    id: "565769460",
    title: "Jean-Pierre Brandt & Christine Hassler for The Elder Statesman",
    duration: 290,
    thumbnail:
      "https://i.vimeocdn.com/video/1169906676-605338a9a2e793353031a1efd18e792c1f44c873109bfd518f0617069c3ecb96-d_640?region=us",
    width: 1500,
    height: 1124,
  },
  {
    id: "485481081",
    title: "Burna Boy - Thuggin' + Darko",
    duration: 282,
    thumbnail:
      "https://i.vimeocdn.com/video/1005273104-90cf470f5f211809e1a045ba9a310a7ebc1412166e2ebce643a069163be64e39-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "483321696",
    title: "Adidas - Stormzy",
    duration: 15,
    thumbnail:
      "https://i.vimeocdn.com/video/1415242389-323ad98aa7f80811c677ded64ffc3e4eb40cc1f19e003a8a9db7b5f74c36b7ef-d_640?region=us",
    width: 480,
    height: 480,
  },
  {
    id: "483314805",
    title: "THE FACE King Princess Digital Cover",
    duration: 11,
    thumbnail:
      "https://i.vimeocdn.com/video/1001727148-ac1e27974aa953da861cfda7a0f6f894bd66c03b20099c658ace62edcc94fe23-d_640?region=us",
    width: 2000,
    height: 1500,
  },
  {
    id: "420796880",
    title: "ONYX Collective ft. Kelsey Lu - Where or When",
    duration: 191,
    thumbnail:
      "https://i.vimeocdn.com/video/1001746349-42608155a3faffaa0fa0678233d2f1188faede6967ad34116c66abe085955ef9-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "316349111",
    title: "Versace x 2 Chainz",
    duration: 31,
    thumbnail:
      "https://i.vimeocdn.com/video/1001730125-f74fd5d0de315034b6f80daff77aeb1d8d9139929b39dd5863b435ae8b7c7d10-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "295744139",
    title: "Adidas Originals - Paul Pogba",
    duration: 59,
    thumbnail:
      "https://i.vimeocdn.com/video/1001740525-28e5d95328a0f8385160d2cd0d5f687227662030446245af572eaf7b881dc9ac-d_640?region=us",
    width: 1920,
    height: 1080,
  },
  {
    id: "286650095",
    title: "Protoje ft. Chronixx - No Guarantee",
    duration: 274,
    thumbnail:
      "https://i.vimeocdn.com/video/1001744922-6d773f503eca59c4b622eebbd2368480d37d4d87645c9597db9637d1a0b47432-d_640?region=us",
    width: 1920,
    height: 1080,
  },
] as const;

export const NO_SCHOOL_VIDEOS: NoSchoolVideo[] = RAW.map((video) => ({
  ...video,
  vimeoUrl: `https://vimeo.com/${video.id}`,
  slug: slugify(video.title, video.id),
}));

export function getNoSchoolVideoBySlug(slug: string): NoSchoolVideo | undefined {
  return NO_SCHOOL_VIDEOS.find((video) => video.slug === slug);
}

export function noSchoolAspectRatio(video: Pick<NoSchoolVideo, "width" | "height">): string {
  return `${video.width} / ${video.height}`;
}
