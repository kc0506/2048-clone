import { TileProps } from "./Tile";

function transposeMatrix<T>(arr: T[][]) {
    return arr[0].map((_, j) => arr.map((row) => row[j]));
}
export { transposeMatrix };

function setById<T extends { id: number }>(arr: T[], id: number, val: Partial<Omit<T, "id">>) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
            arr[i] = { ...arr[i], ...val };
            break;
        }
    }
}

function getById<T extends { id: number }>(arr: T[], id: number): T | undefined {
    return arr.find((x) => x.id === id);
}
export { setById, getById };

function tilesToBoard(tiles: TileProps[], shape: [number, number]) {
    const EMPTYBOARD = Array.from(Array(shape[0])).map(() => Array.from(Array(shape[1])));

    const board = EMPTYBOARD.map((row) => row.map((_) => ({ id: -1, val: -1 })));
    tiles.forEach(({ pos: [i, j], id, val }) => {
        board[i][j] = { id, val };
    });
    return board;
}

export { tilesToBoard };

function shuffle(arr: readonly any[]) {
    const newArr = [...arr];
    newArr.sort(() => Math.random() - 0.5); // ? why is 0.5 needed
    return newArr;
}

function shiftSet<T>(set: Set<T>) {
    for (const value of set) {
        set.delete(value);
        return value;
    }
    throw "empty set";
}

export { shiftSet, shuffle };

type ObjectFromEntries<T extends [string | number, any]> = {
    [K in T[0]]: T extends [K, any] ? T[1] : never;
};
type ArrToUnion<T extends any[]> = T extends [infer A, ...infer B] ? A | ArrToUnion<B> : never;

type FromEntries<T extends any[]> = ArrToUnion<T> extends [string | number, any]
    ? ObjectFromEntries<ArrToUnion<T>>
    : {};

function fromEntries<T extends any[]>(arr: T): FromEntries<T> {
    return {} as FromEntries<T>;
}

const y: FromEntries<[[1, 2], [3, 4]]> = fromEntries([
    [1, 2],
    [3, 4],
] as const);
