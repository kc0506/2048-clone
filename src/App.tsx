
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './App.css'
import { shiftSet, shuffle, tilesToBoard } from './utils';
import Tile, { Pos, TileProps } from './Tile';
import { moveDown, moveLeft, moveRight, moveUp } from './move';


// TODO: dynamic config
const SIZE = 4;
const EMPTYBOARD = Array.from(Array(SIZE)).map(() => Array.from(Array(SIZE)))

export { EMPTYBOARD, SIZE }

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

function checkLose(tiles: TileProps[]) {
	const [, l] = moveLeft({ tiles, silent: true });
	const [, r] = moveRight({ tiles, silent: true });
	const [, u] = moveUp({ tiles, silent: true });
	const [, d] = moveDown({ tiles, silent: true });

	return !(l || r || u || d);
}


const INITIAL_TILES = 4

type ContainerProps = {
	lose: boolean,
	setLose: React.Dispatch<React.SetStateAction<boolean>>,
}
const Container = forwardRef(function Container({ lose: lose, setLose }: ContainerProps, ref) {

	const idPool = useRef(new Set<number>(shuffle(EMPTYBOARD.flat(1).flatMap((_, i) => [i, i + EMPTYBOARD.flat().length]))));
	const posPool = useRef<Pos[]>(shuffle(EMPTYBOARD.flatMap((row, i) => row.map((_, j) => [i, j]))));


	const [tiles, setTiles] = useState<TileProps[]>(() => Array.from(Array(INITIAL_TILES)).map(_ => getNewTile()));

	function reset() {
		idPool.current = new Set<number>(shuffle(EMPTYBOARD.flat(1).flatMap((_, i) => [i, i + EMPTYBOARD.flat().length])))
		posPool.current = shuffle(EMPTYBOARD.flatMap((row, i) => row.map((_, j) => [i, j])))
		setTiles([]);
		requestAnimationFrame(() => {
			setTiles(Array.from(Array(INITIAL_TILES)).map(_ => getNewTile()));
		});
	}
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

		const newVal = [1, 2][Math.floor(Math.random() * 2)]

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

				setLose(checkLose(newTiles));
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

	const handler = (e: KeyboardEvent, tiles: TileProps[]) => {

		// * pass tiles as parameter so that it can be assigned

		if (lose)
			return;

		let addToIdPool = [];
		if (running.current) {
			clearTimeout(timeoutId.current);
			[tiles, addToIdPool] = cleanUpTiles(tiles);
			addToIdPool.forEach(id => idPool.current.add(id));

			if (checkLose(tiles)) {
				setLose(true);
				return;
			}
			running.current = false;
		}

		let newTiles: TileProps[], hasMove: boolean;
		const args = { tiles: tiles, silent: false, idPool: idPool.current } as const;
		switch (e.key) {
			case 'ArrowLeft':
				[newTiles, hasMove] = moveLeft(args);
				break;
			case 'ArrowRight':
				[newTiles, hasMove] = moveRight(args);
				break;
			case 'ArrowUp':
				[newTiles, hasMove] = moveUp(args);
				break;
			case 'ArrowDown':
				[newTiles, hasMove] = moveDown(args);
				break;
			default:
				return;
		}

		const board = tilesToBoard(newTiles);
		posPool.current = getFreePos(board);
		if (hasMove)
			newTiles.push(getNewTile());

		running.current = true;
		setTiles(newTiles);
		timeoutId.current = setTimeout(completeMove, 500);
	}

	useEffect(() => {
		const f = (e: KeyboardEvent) => handler(e, tiles);
		document.addEventListener('keydown', f)
		return () => document.removeEventListener('keydown', f);
	});

	// TODO score
	return <div className="container">
		<div className="cell-container">
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

	return <div className='app-container'>
		<div id="newgame" onClick={() => ref.current.reset()}>New Game</div>
		<Container ref={ref} lose={lose} setLose={setLose} />
		{
			// TODO: lose screen
			lose && <div style={{color: 'black'}}>
				YOU LOSE!!
			</div>
		}
	</div>
}

export default App