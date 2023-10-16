import { ObjectFromEntriesArr } from "./utilTypes";

declare global {
    interface ObjectConstructor {
        // fromEntries<T extends Iterable<readonly [PropertyKey, any]>>(
        //     entries: T
        // ): ObjectFromEntriesArr<T>;
    }
}
