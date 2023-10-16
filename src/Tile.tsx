import useConfig from "./useConfig";

const MAX_LEVEL = 20

const pow2: Record<number, number> = {}
for (let l = 1, b = 2; l <= MAX_LEVEL; l++, b *= 2)
    pow2[l] = b;
export { pow2 }


const bgColors: Record<number, string> = {
    1: 'rgb(238, 228, 218)',
    2: '#eee1c9',
    3: '#f3b27a',
    4: '#f69664',
    5: '#f77c5f',
    6: '#f75f3b',
    7: '#edd073',
    8: '#edcc62',
    9: '#edc950',
}

const color: Record<number, string> = {
    1: 'rgb(119, 110, 101)',
    2: 'rgb(119, 110, 101)',
    3: '#f9f6f2',
    4: '#f9f6f2',
    5: '#f9f6f2',
    6: '#f9f6f2',
}

// const SIZE = 4;
// const WIDTH = 450
// const GAP = 14
// const CELL_SIZE = (WIDTH - GAP * (SIZE + 1)) / SIZE

const disable = false;

type Pos = [number, number];

type TileProps = {
    _pos: string,
    pos: Pos;
    id: number;
    val: number;
    merged: boolean;
    animation: string;
};
export type { Pos, TileProps }

function Tile(props: TileProps) {

    const { config: { gap, cellSize } } = useConfig();

    try {
        const { animation, val, pos: [i, j] } = props;

        const offsetX = gap + j * (gap + cellSize);
        const offsetY = gap + i * (gap + cellSize);
        return (
            <div
                style={{
                    // transform: `translate(${offsetX}px, ${offsetY}px)`,
                    left: `${offsetX}px`,
                    top: `${offsetY}px`,
                    width: `${cellSize}px`,
                    fontSize: (val >= 7 ? 45 : 55) * (cellSize <= 75 ? 0.75 : 1),
                    color: color[val],
                    backgroundColor: bgColors[val],
                }}
                className={`tile ${disable ? '' : animation}`}
            >
                {pow2[val]}
            </div>
        )
    } catch (e) {
        console.log('error: ', props);
    }
}

export default Tile