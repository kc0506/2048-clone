import { TileProps } from "./Tile";
import { getById, setById, shiftSet, tilesToBoard, transposeMatrix } from "./utils";

type Args = {
    tiles: TileProps[];
    reverse?: boolean;
    transpose?: boolean;

    shape: [number, number],
} & ({ silent: true; idPool?: undefined } | { silent: false; idPool: Set<number> });

function move({shape, tiles, silent, reverse, idPool, transpose }: Args): [TileProps[], boolean] {
    let board = tilesToBoard(tiles , shape);
    const newTiles = [...tiles];

    if (transpose) board = transposeMatrix(board);

    let hasMove: boolean = false;
    board.forEach((row, i) => {
        const rowSize = row.length;

        row = row.filter(({ id }) => id !== -1);
        if (reverse) row.reverse();
        if (row.length === 0) return [];

        let cur = -1;
        let mergedCnt = 0;

        for (let j = 0; j <= row.length; j++) {
            const curVal = cur > -1 ? row[cur].val : -1;
            const newVal = j < row.length ? row[j].val : -1;

            const y = cur - mergedCnt;
            const pos: [number, number] = transpose
                ? [reverse ? rowSize - 1 - y : y, i]
                : [i, reverse ? rowSize - 1 - y : y];

            if (cur === -1 || curVal !== newVal) {
                if (cur !== -1) {
                    setById(newTiles, row[cur].id, { val: curVal, pos });
                    const tile = getById(tiles, row[cur].id);
                    hasMove = hasMove || pos.join(" ") !== tile?.pos.join(" ");
                }
                cur = j;
            } else {
                hasMove = true;
                setById(newTiles, row[cur].id, { val: curVal, pos, merged: true });
                setById(newTiles, row[j].id, { val: curVal, pos, merged: true });

                if (!silent) {
                    const newTile: TileProps = {
                        id: shiftSet(idPool),
                        _pos: pos.join(", "),
                        pos,
                        merged: false,
                        val: curVal + 1,
                        animation: "popup",
                    };
                    newTiles.push(newTile);
                }

                mergedCnt++;
                cur = -1;
            }
        }
    });

    return [newTiles, hasMove];
}

function moveLeft(args: Args) {
    return move({ ...args, reverse: false });
}
function moveRight(args: Args) {
    return move({ ...args, reverse: true });
}
function moveUp(args: Args) {
    return move({ ...args, transpose: true });
}
function moveDown(args: Args) {
    return move({ ...args, transpose: true, reverse: true });
}

export { moveLeft, moveRight, move, moveDown, moveUp };
