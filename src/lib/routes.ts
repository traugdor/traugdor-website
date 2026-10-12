export interface Route {
  /** Command and URL segment, e.g. `santos` -> `/santos`. */
  name: string;
  path: string;
  title: string;
  blurb: string;
}

export const GITHUB_URL = 'https://github.com/traugdor';
export const KOFI_URL = 'https://ko-fi.com/quadmoonxiv';
export const HOME_PATH = '/';

/** Project routes in display order. The order drives numbering and "next project" links. */
export const projectRoutes: readonly Route[] = [
  { name: 'santos', path: '/santos', title: 'SantOS', blurb: 'a learning project that grew a kernel' },
  { name: 'vintage-story', path: '/vintage-story', title: 'Vintage Story mods', blurb: 'Expanded Stomach, Remedy and Ruin' },
  { name: 'snakeoil', path: '/snakeoil', title: 'SnakeOil Synth', blurb: 'chasing a sound for years' },
  { name: 'comfyui', path: '/comfyui', title: 'ComfyUI nodes', blurb: 'upscaling and audio' },
  { name: 'research', path: '/research', title: 'Research', blurb: 'persistence, huge numbers, pi on a GPU' },
];

export const contactRoute: Route = {
  name: 'contact',
  path: '/contact',
  title: 'Contact',
  blurb: 'say hello',
};

/** Every page the terminal can navigate to, excluding home. */
export const allRoutes: readonly Route[] = [...projectRoutes, contactRoute];
