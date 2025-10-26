import 'styled-components';
import { Theme } from './theme/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// Declare global embed APIs
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}
