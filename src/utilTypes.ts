type ObjectFromEntriesUnion<T extends [PropertyKey, any] | readonly [PropertyKey, any]> = {
    [K in T[0]]: T extends [K, any] | readonly [K, any] ? T[1] : never;
};

type ArrToUnion<T extends readonly any[]> = T extends readonly [infer A, ...infer B]
    ? A | ArrToUnion<B>
    : never;

type ObjectFromEntriesArr<T extends readonly any[]> = ArrToUnion<T> extends readonly [
    PropertyKey,
    any
]
    ? ObjectFromEntriesUnion<ArrToUnion<T>>
    : ArrToUnion<T>;

export type { ObjectFromEntriesArr };
