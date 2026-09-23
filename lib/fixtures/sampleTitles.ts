import type { Title } from "../types";

/**
 * Local dev fallback used only when TMDB_API_KEY is unset, so the swipe /
 * match / round flow can be exercised end-to-end without live keys.
 * `posterUrl` is intentionally null — SwipeCard renders a plush placeholder
 * for these instead of depending on network images during local dev.
 */
export const SAMPLE_TITLES: Title[] = [
  t("movie", 1, "Monsoon Wedding Redux", 2019, 7.6, 122, "A chaotic big-fat-wedding weekend where three generations quietly renegotiate what family means.", ["Comedy", "Drama", "Family"]),
  t("movie", 2, "The Quiet Heist", 2022, 7.2, 108, "A soft-spoken locksmith is talked into one last job by the sister he hasn't spoken to in years.", ["Crime", "Thriller"]),
  t("tv", 3, "Second Innings", 2021, 8.1, 45, "A retired cricketer becomes the reluctant coach of a broke women's team with nothing to lose.", ["Drama", "Comedy"]),
  t("movie", 4, "Ghost of Malabar Hill", 2020, 7.4, 115, "A skeptical insurance investigator can't explain why every clue in a cold case leads to the same locked house.", ["Horror", "Mystery"]),
  t("movie", 5, "Two Idiots and a Map", 2018, 6.9, 101, "Best friends road-trip across three states to deliver a wedding invitation, and nothing else, on time.", ["Comedy"]),
  t("tv", 6, "Court No. 4", 2023, 8.4, 50, "A rookie public defender in Chennai takes on cases nobody else in the office wants.", ["Drama", "Crime"]),
  t("movie", 7, "Static", 2021, 7.8, 96, "A sound engineer starts hearing something on old tape recordings that shouldn't be there.", ["Horror", "Thriller"]),
  t("movie", 8, "Love, Reheated", 2022, 7.0, 118, "Divorced exes are forced to co-host their daughter's engagement party at the restaurant where they first met.", ["Romance", "Comedy"]),
  t("movie", 9, "The Last Local", 2019, 7.5, 132, "Three strangers on the last train out of Mumbai before the strike discover they're connected.", ["Thriller", "Drama"]),
  t("tv", 10, "Borderlines", 2020, 8.6, 48, "A customs officer on the Punjab border gets pulled into a smuggling case that implicates her own family.", ["Crime", "Thriller", "Drama"]),
  t("movie", 11, "Nocturne for Two", 2023, 7.3, 104, "A classical violinist and a street musician are forced to prepare for the same audition, together.", ["Romance", "Drama", "Music"]),
  t("movie", 12, "Red Ants", 2017, 7.1, 112, "A small-town cop investigates a string of disappearances the state government would rather ignore.", ["Crime", "Thriller"]),
  t("movie", 13, "Picture Perfect Family", 2021, 6.8, 110, "A wedding photographer's carefully staged shoot unravels one relative's secret at a time.", ["Comedy", "Drama"]),
  t("tv", 14, "The Understudy", 2022, 8.0, 42, "A theatre troupe's rehearsal season turns competitive, then tender, then something else entirely.", ["Drama", "Romance"]),
  t("movie", 15, "Signal Lost", 2020, 7.7, 99, "A submarine communications officer realizes the distress call she's decoding is from thirty years ago.", ["Mystery", "Thriller", "Science Fiction"]),
  t("movie", 16, "Half Price Honeymoon", 2019, 6.7, 105, "Newlyweds on a shoestring budget trip discover their travel agent booked them into a ghost story.", ["Comedy", "Horror"]),
  t("tv", 17, "Dosa King", 2021, 8.2, 40, "Three siblings inherit their father's failing restaurant chain and one impossible recipe.", ["Comedy", "Drama", "Family"]),
  t("movie", 18, "The Interview Room", 2018, 7.9, 118, "A hostage negotiator's biggest case turns out to be someone from her own past.", ["Thriller", "Crime"]),
  t("movie", 19, "Rewind Sunday", 2022, 7.2, 107, "A man wakes up reliving the worst Sunday of his life — and slowly realizes he's not the only one.", ["Science Fiction", "Mystery", "Drama"]),
  t("movie", 20, "Elephant Route", 2020, 7.6, 128, "A forest officer and a poacher-turned-informant cross paths with a herd nobody was supposed to find.", ["Drama", "Adventure"]),
  t("tv", 21, "Backbench", 2023, 8.3, 35, "A batch of engineering students navigate placements, heartbreak, and one legendary faculty grudge.", ["Comedy", "Drama", "Romance"]),
  t("movie", 22, "The Wedding Vendor", 2019, 6.9, 109, "A caterer double-booked for two weddings on the same day has forty-eight hours to fix it.", ["Comedy"]),
  t("movie", 23, "Salt Water", 2021, 7.4, 116, "A fisherman's daughter takes over the family boat and uncovers why the catch has been disappearing.", ["Drama", "Mystery"]),
  t("movie", 24, "Midnight Local Train", 2018, 7.8, 103, "Five strangers stuck on a stalled train slowly realize one of them isn't a stranger at all.", ["Thriller", "Mystery"]),
  t("tv", 25, "Chai Break", 2022, 7.9, 38, "Office workers at a Bangalore startup bond, betray, and bail each other out over the tea cart.", ["Comedy", "Drama"]),
  t("movie", 26, "The Vanishing Point", 2020, 8.0, 121, "A cartographer is hired to redraw a village that officially stopped existing forty years ago.", ["Mystery", "Drama"]),
  t("movie", 27, "Two Left Shoes", 2021, 6.8, 98, "A failed dance instructor gets one more shot when his worst student turns out to be a prodigy.", ["Comedy", "Romance"]),
  t("movie", 28, "Faultline", 2019, 7.5, 124, "An earthquake engineer races to warn a city that ignored her report a decade ago.", ["Thriller", "Drama"]),
  t("tv", 29, "The Waitlist", 2023, 8.5, 46, "A transplant coordinator's toughest calls happen after the surgery, not before.", ["Drama"]),
  t("movie", 30, "Coconut Grove", 2018, 6.9, 106, "A city lawyer inherits her grandmother's failing coastal resort and the staff who refuse to let it die.", ["Comedy", "Drama"]),
  t("movie", 31, "The Understanding", 2022, 7.3, 111, "An arranged marriage becomes an unlikely partnership when both parties admit they're already in love with someone else.", ["Romance", "Drama", "Comedy"]),
  t("movie", 32, "Cold Case Kollam", 2020, 7.7, 119, "A retired inspector is pulled back for one case: the one he never closed.", ["Crime", "Mystery", "Thriller"]),
  t("tv", 33, "Startup Circus", 2021, 7.6, 44, "Four co-founders try to keep their app alive through funding rounds, breakups, and one very public failure.", ["Comedy", "Drama"]),
  t("movie", 34, "The Last Reel", 2019, 8.1, 130, "A dying single-screen cinema owner fights to show one final film before the building is sold.", ["Drama"]),
  t("movie", 35, "Paper Boats", 2022, 6.7, 100, "Childhood best friends reunite as adults to fulfil a promise they made at age nine.", ["Drama", "Romance", "Family"]),
  t("movie", 36, "The Negotiation", 2020, 7.8, 114, "A hostage crisis at a bank turns out to be about something far smaller, and far sadder, than money.", ["Thriller", "Crime", "Drama"]),
  t("tv", 37, "Ration Card", 2023, 8.2, 41, "A ration shop owner in a small town becomes the reluctant confidant of the whole neighbourhood.", ["Drama", "Comedy"]),
  t("movie", 38, "Terminal Two", 2021, 7.0, 102, "An airport delay throws two exes, a missed flight, and one very determined toddler into the same gate lounge.", ["Comedy", "Romance"]),
  t("movie", 39, "The Understudy's Understudy", 2018, 6.9, 97, "Backstage at a fading theatre festival, ambition and loyalty keep trading places.", ["Drama", "Comedy"]),
  t("movie", 40, "Highway 47", 2022, 7.4, 123, "A trucker and a hitchhiker running from very different things end up needing the same thing: time.", ["Drama", "Thriller"]),
];

function t(
  mediaKind: "movie" | "tv",
  tmdbId: number,
  name: string,
  year: number,
  rating: number,
  runtimeMinutes: number,
  synopsis: string,
  genres: string[]
): Title {
  return {
    id: `${mediaKind}-${tmdbId}`,
    tmdbId,
    mediaKind,
    name,
    year,
    posterUrl: null,
    rating,
    runtimeMinutes,
    synopsis,
    genres,
  };
}
