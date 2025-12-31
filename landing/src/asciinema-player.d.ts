/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


declare module 'asciinema-player' {
  export interface PlayerOptions {
    cols?: number;
    rows?: number;
    autoPlay?: boolean;
    preload?: boolean;
    loop?: boolean | number;
    startAt?: number | string;
    speed?: number;
    idleTimeLimit?: number;
    theme?: string | {
      background?: string;
      foreground?: string;
    };
    poster?: string;
    fit?: 'width' | 'height' | 'both' | false;
    terminalFontSize?: 'small' | 'medium' | 'big' | string;
    terminalFontFamily?: string;
    terminalLineHeight?: number;
  }

  export interface Player {
    play(): Promise<void>;
    pause(): void;
    seek(time: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    dispose(): void;
    addEventListener(event: string, handler: Function): void;
  }

  export function create(
    src: string,
    element: HTMLElement,
    options?: PlayerOptions
  ): Player;
}
