import { CircleDot, Compass, Target } from "lucide-react";

// Placeholder catalog -- names and mechanics are not final.
export const GAMES = [
  {
    id: "squeeze-pop",
    name: "Squeeze Pop",
    desc: "Squeeze to pop the bubbles before they float away.",
    trains: "Grip",
    minutes: 2,
    tint: "sky",
    icon: CircleDot,
  },
  {
    id: "tilt-maze",
    name: "Tilt Maze",
    desc: "Turn your wrist to roll the ball to the finish.",
    trains: "Wrist",
    minutes: 3,
    tint: "lavender",
    icon: Compass,
  },
  {
    id: "hold-steady",
    name: "Hold Steady",
    desc: "Keep your squeeze in the green zone as long as you can.",
    trains: "Grip control",
    minutes: 2,
    tint: "mint",
    icon: Target,
  },
];
