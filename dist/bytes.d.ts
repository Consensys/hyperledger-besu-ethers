import { BytesLike, Hexable, DataOptions } from '@ethersproject/bytes';
export declare function arrayify(value: BytesLike | Hexable | number | string, options?: DataOptions): Uint8Array;
export declare function hexlify(value: BytesLike | Hexable | number | string, options?: DataOptions): string;
