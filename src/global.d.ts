import { Buffer } from 'buffer';

declare global {
    interface Window {
        Buffer: typeof Buffer;
        process: {
            env: {
                [key: string]: string | undefined;
            };
        };
        global: Window & typeof globalThis;
    }
}
