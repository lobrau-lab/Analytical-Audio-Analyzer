import heroStudioImg from "../assets/images/hero_studio_atelier_1795074873039.jpg";
import spaceOddityImg from "../assets/images/preset_space_oddity_1795074873282.jpg";
import hotelCaliforniaImg from "../assets/images/preset_hotel_california_1795074872153.jpg";
import eleanorRigbyImg from "../assets/images/preset_eleanor_rigby_1795074872055.jpg";

export const HERO_STUDIO_IMAGE = heroStudioImg;

export interface SongPreset {
  id: string;
  title: string;
  artist: string;
  year: string;
  description: string;
  genre: string;
  tone: string;
  era: string;
  image: string;
  imageAlt: string;
  context: string;
  lyrics: string;
}

export const SONG_PRESETS: SongPreset[] = [
  {
    id: "space-oddity",
    title: "Space Oddity",
    artist: "David Bowie",
    year: "1969",
    description: "Orbital estrangement and quiet surrender beyond telemetry.",
    genre: "Sci-Fi & Speculative",
    tone: "Melancholic & Haunting",
    era: "Retro-Futurist / Far Future",
    image: spaceOddityImg,
    imageAlt: "Vintage astronaut helmet resting beside a capsule porthole facing a crescent horizon",
    context: "Space Oddity by David Bowie. A dialogue of isolated cosmic voyage and quiet disconnection from Earth.",
    lyrics: `Ground Control to Major Tom
Ground Control to Major Tom
Take your protein pills and put your helmet on
Ground Control to Major Tom (ten, nine, eight, seven, six)
Commencing countdown, engines on (five, four, three)
Check ignition and may God's love be with you (two, one, liftoff)

This is Ground Control to Major Tom
You've really made the grade
And the papers want to know whose shirts you wear
Now it's time to leave the capsule if you dare
"This is Major Tom to Ground Control
I'm stepping through the door
And I'm floating in a most peculiar way
And the stars look very different today

For here am I sitting in a tin can
Far above the world
Planet Earth is blue
And there's nothing I can do"`,
  },
  {
    id: "hotel-california",
    title: "Hotel California",
    artist: "Eagles",
    year: "1976",
    description: "Desert gothic noir inside an opulent, inescapable sanctuary.",
    genre: "Noir & Psychological Thriller",
    tone: "Tense & Suspenseful",
    era: "Mid-20th Century (1940s–1970s)",
    image: hotelCaliforniaImg,
    imageAlt: "Twilight desert highway leading toward a warm-lit Spanish colonial archway framed by palms",
    context: "Hotel California by Eagles. A mysterious desert estate that doubles as a seductive trap for weary travelers.",
    lyrics: `On a dark desert highway, cool wind in my hair
Warm smell of colitas, rising up through the air
Up ahead in the distance, I saw a shimmering light
My head grew heavy and my sight grew dim
I had to stop for the night.

There she stood in the doorway;
I heard the mission bell
And I was thinking to myself
'This could be heaven or this could be hell'
Then she lit up a candle and she showed me the way
There were voices down the corridor,
I thought I heard them say

Welcome to the Hotel California
Such a lovely place (such a lovely place)
Such a lovely face.
Plenty of room at the Hotel California
Any time of year (any time of year) you can find it here.

Last thing I remember, I was running for the door
I had to find the passage back to the place I was before
'Relax' said the night man, 'We are programmed to receive.
You can check out any time you like, but you can never leave!'`,
  },
  {
    id: "eleanor-rigby",
    title: "Eleanor Rigby",
    artist: "The Beatles",
    year: "1966",
    description: "Chamber string tragedy tracing two parallel, unwitnessed lives.",
    genre: "Victorian & Chamber Gothic",
    tone: "Melancholic & Haunting",
    era: "Victorian / Gilded Age",
    image: eleanorRigbyImg,
    imageAlt: "Monochrome stone English chapel nave with afternoon light falling across wooden pews and a glass jar",
    context: "Eleanor Rigby by The Beatles. An orchestral character study of unseen solitude and parish sorrow.",
    lyrics: `Ah, look at all the lonely people
Ah, look at all the lonely people

Eleanor Rigby picks up the rice in the church where a wedding has been
Lives in a dream
Waits at the window, wearing the face that she keeps in a jar by the door
Who is it for?

All the lonely people
Where do they all come from?
All the lonely people
Where do they all belong?

Father McKenzie writing the words of a sermon that no one will hear
No one comes near.
Look at him working, darning his socks in the night when there's nobody there
What does he care?

Eleanor Rigby died in the church and was buried along with her name
Nobody came.
Father McKenzie wiping the dirt from his hands as he walks from the grave
No one was saved.`,
  },
];
