
import { useMemo, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './App.css'
// import './output.css'
import { shiftSet, shuffle, tilesToBoard } from './utils';
import Tile, { Pos, TileProps, pow2 } from './Tile';
import { moveDown, moveLeft, moveRight, moveUp } from './move';
import useConfig, { ConfigProvider } from './useConfig';
import { useDrag } from '@use-gesture/react'


// TODO: dynamic config

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

enum Direction {
	LEFT,
	RIGHT,
	UP,
	DOWN,
}

type ContainerProps = {
	lose: boolean,
	setLose: React.Dispatch<React.SetStateAction<boolean>>,
	score: number,
	setScore: React.Dispatch<React.SetStateAction<number>>,
}
const Container = forwardRef(function Container({ lose, setLose, setScore }: ContainerProps, ref) {

	const idPool = useRef<Set<number>>(null!);
	const posPool = useRef<Pos[]>(null!);

	const [tiles, setTiles] = useState<TileProps[]>([]);

	const { config: { initTiles, shape, gap, containerSize, initVal } } = useConfig();
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

	useEffect(() => {
		reset();
	}, []);

	useImperativeHandle(ref, () => {
		return {
			reset,
		}
	});



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

	// const a = 32 - idPool.current.size - tiles.length
	// const b = 16 - posPool.current.length - tiles.length
	// console.log(a,b);
	// console.log('len: ', tiles.length)

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


	const bind = useDrag(({ swipe }) => {
		// console.log(swipe[0], swipe[1])
		if (swipe[0]) {
			if (swipe[0] === 1)
				handler(Direction.RIGHT, tiles)
			if (swipe[0] === -1)
				handler(Direction.LEFT, tiles)
		} else {
			if (swipe[1] === 1)
				handler(Direction.DOWN, tiles)
			if (swipe[1] === -1)
				handler(Direction.UP, tiles)
		}
	})

	// console.log(containerSize)
	// TODO score
	return <div className="container" {...bind()} >
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