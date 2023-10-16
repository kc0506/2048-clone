
import { useRef } from 'react';
import { shiftSet, tilesToBoard } from './utils';
import { Pos, TileProps, pow2 } from './Tile';
import { moveDown, moveLeft, moveRight, moveUp } from './move';
import useConfig from './useConfig';
import { Direction } from './App';

function getFreePos(board: { id: number, val: number }[][]) {
    const posPool: Pos[] = [];
    board.forEach((row, i) => row.forEach(({ id }, j) => {
        if (id === -1)
            posPool.push([i, j]);
    }))
    return posPool;
}

function cleanUpTiles(tiles: TileProps[]) {

    let newTiles = tiles.filter(({ merged }) => !merged);
    const addToIdPool = tiles.filter(({ merged }) => merged).map(({ id }) => id);

    newTiles = newTiles.map(tile => ({ ...tile, animation: '' }))

    return [newTiles, addToIdPool] as const
}

function checkLose(tiles: TileProps[], shape: [number, number]) {
    const args = { tiles, silent: true, shape } as const;
    const [, l] = moveLeft(args);
    const [, r] = moveRight(args);
    const [, u] = moveUp(args);
    const [, d] = moveDown(args);

    return !(l || r || u || d);
}

type Ref<T> = React.MutableRefObject<T>
type SetState<T> = React.Dispatch<React.SetStateAction<T>>

type Props = {
    idPool: Ref<Set<number>>,
    posPool: Ref<Pos[]>,
    tiles: TileProps[],
    setTiles: SetState<TileProps[]>,
    lose: boolean,
    setLose: SetState<boolean>,
    setScore: SetState<number>,
}

function useMove({
    idPool, posPool, tiles, setTiles,
    lose, setLose, setScore,
}: Props) {

    const { config: { shape, initVal } } = useConfig();

    function getNewTile(): TileProps {
        // ? When is this called
        // => after user move, i.e. there is always spare room

        const newId = shiftSet(idPool.current);
        const newPos = posPool.current.shift();

        if (!newPos) {
            throw `error: newPos is undefined.` + tiles
        }

        const newVal = initVal[Math.floor(Math.random() * initVal.length)]

        return {
            pos: newPos,
            _pos: newPos.join(', '),
            id: newId,
            val: newVal,
            merged: false,
            animation: 'appear',
        }
    }

    const running = useRef(false);
    const timeoutId = useRef(0);
    function completeMove() {
        if (running.current) {
            setTiles(tiles => {
                let [newTiles, addToIdPool] = cleanUpTiles(tiles);
                addToIdPool.forEach(id => idPool.current.add(id));

                setLose(checkLose(newTiles, shape));
                return newTiles
            });
            running.current = false;
        } else
            // otherwise this timeout should be canceled.
            throw 'unexpected: should be freezed.'
    }

    const handler = (dir: Direction, tiles: TileProps[]) => {

        // * pass tiles as parameter so that it can be assigned

        if (lose)
            return;

        let addToIdPool = [];
        if (running.current) {
            clearTimeout(timeoutId.current);
            [tiles, addToIdPool] = cleanUpTiles(tiles);
            addToIdPool.forEach(id => idPool.current.add(id));

            if (checkLose(tiles, shape)) {
                setLose(true);
                return;
            }
            running.current = false;
        }

        const moveFn = {
            [Direction.LEFT]: moveLeft,
            [Direction.RIGHT]: moveRight,
            [Direction.UP]: moveUp,
            [Direction.DOWN]: moveDown,
        } as const

        const args = { tiles: tiles, silent: false, idPool: idPool.current, shape } as const;
        const [newTiles, hasMove] = moveFn[dir](args);

        const board = tilesToBoard(newTiles, shape);
        posPool.current = getFreePos(board);
        if (hasMove)
            newTiles.push(getNewTile());

        const addScore = newTiles.filter(({ animation }) => animation === 'popup').reduce((prev, { val }) => {
            return prev + pow2[val];
        }, 0);
        setScore(score => score + addScore);

        running.current = true;
        setTiles(newTiles);
        timeoutId.current = setTimeout(completeMove, 500);
    }

    return { handler, getNewTile }
}
export default useMove