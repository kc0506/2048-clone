
import { useMemo, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './App.css'
import { shuffle } from './utils';
import Tile, { Pos, TileProps } from './Tile';
import useConfig, { ConfigProvider } from './useConfig';
import useGestureMove from './useGestureMove';
import useMove from './useTiles';

enum Direction {
	LEFT,
	RIGHT,
	UP,
	DOWN,
}
export { Direction }

type ContainerProps = {
	lose: boolean,
	setLose: React.Dispatch<React.SetStateAction<boolean>>,
	score: number,
	setScore: React.Dispatch<React.SetStateAction<number>>,
}
const Container = forwardRef(function Container({ lose, setLose, setScore }: ContainerProps, ref: React.ForwardedRef<{ reset: () => void }>) {

	const idPool = useRef<Set<number>>(null!);
	const posPool = useRef<Pos[]>(null!);

	const [tiles, setTiles] = useState<TileProps[]>([]);

	const { config: { initTiles, shape, gap, containerSize } } = useConfig();
	const EMPTYBOARD = useMemo(() => {
		return Array.from(Array(shape[0])).map(() => Array.from(Array(shape[1])))
	}, [shape.join(' ')]);

	function reset() {
		idPool.current = new Set<number>(shuffle(EMPTYBOARD.flat(1).flatMap((_, i) => [i, i + EMPTYBOARD.flat().length])))
		posPool.current = shuffle(EMPTYBOARD.flatMap((row, i) => row.map((_, j) => [i, j])))
		setTiles([]);
		setLose(false);
		setScore(0);
		requestAnimationFrame(() => {
			setTiles(Array.from(Array(initTiles)).map(_ => getNewTile()));
		});
	}

	useEffect(() => reset(), []);
	useImperativeHandle(ref, () => ({ reset }));

	const { handler, getNewTile } = useMove({ idPool, posPool, tiles, setTiles, lose, setLose, setScore });

	useEffect(() => {
		const f = (e: KeyboardEvent) => {
			const keyMap = [
				[Direction.LEFT, ['ArrowLeft', 'a', 'A']],
				[Direction.RIGHT, ['ArrowRight', 'd', 'D']],
				[Direction.UP, ['ArrowUp', 'w', 'W']],
				[Direction.DOWN, ['ArrowDown', 's', 'S']],
			] as const
			const dirMap: Record<string, Direction | undefined> = Object.fromEntries(
				keyMap.map(([dir, keys]) => keys.map(key => [key, dir])).flat(1)
			)

			const dir = dirMap[e.key];
			if (dir === undefined)
				return;

			handler(dir, tiles);
		}
		document.addEventListener('keydown', f)
		return () => document.removeEventListener('keydown', f);
	});


	useGestureMove({ handler, tiles, attachBody: true });

	return <div className="container" >
		<div className="cell-container" style={{
			gridTemplateRows: `repeat(${shape[0]}, 1fr)`,
			gridTemplateColumns: `repeat(${shape[1]}, 1fr)`,
			gap,
			height: containerSize[0],
			width: containerSize[1],
		}}>
			{EMPTYBOARD.flat().map((_, i) => <div className='cell' key={`cell${i}`} />)}
		</div>

		{tiles.map(props => {
			return <Tile key={`tile${props.id}`} {...props} />
		})}
	</div>
});


function App() {

	const [lose, setLose] = useState(false);
	const ref = useRef<{ reset: () => void }>(null!);
	const [score, setScore] = useState(0);


	return <ConfigProvider>
		<div className='app-container'>
			<menu className='sider'>
				<input type="range" max={8} min={2} />
				<input type="range" max={8} min={2} />
				<input type="range" />

			</menu>
			<div className="header">
				<div id="newgame" onClick={() => ref.current.reset()}>New Game</div>
				<div id="score">Score: {score}</div>
			</div>
			<Container ref={ref} {...{ lose, setLose, score, setScore }} />
			{
				// TODO: lose screen
				lose && <div style={{ color: 'black' }}>
					YOU LOSE!!
				</div>
			}
		</div>
	</ConfigProvider>
}

export default App