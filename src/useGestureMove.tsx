import { useRef } from 'react';
import { TileProps } from './Tile';
import { useDrag, useGesture, useWheel } from '@use-gesture/react'
import { Direction } from './App';


type useGestureMoveProps = {
    handler: (dir: Direction, tiles: TileProps[]) => void,
    tiles: TileProps[],
    attachBody: boolean,
}
function useGestureMove({ handler, tiles, attachBody }: useGestureMoveProps) {

    const onDrag: Parameters<typeof useDrag>[0] = ({ movement, cancel, dragging }) => {
        // ? not using swipe due to delay

        if (!dragging)
            return;

        const [x, y] = movement;
        const THRES = 30;
        let flag = false;
        if (Math.abs(x) >= Math.abs(y)) {
            if (x >= THRES)
                handler(Direction.RIGHT, tiles), flag = true;
            if (x <= -THRES)
                handler(Direction.LEFT, tiles), flag = true;
        } else {
            if (y >= THRES)
                handler(Direction.DOWN, tiles), flag = true;
            if (y <= -THRES)
                handler(Direction.UP, tiles), flag = true;
        }
        if (flag) {
            cancel();
        }
    }

    const wheelFired = useRef(false)
    const onWheel: Parameters<typeof useWheel>[0] = ({ wheeling, movement }) => {
        const THRES = 50
        if (wheeling) {
            if (wheelFired.current)
                return
            const [mx, my] = movement;
            let flag = false;
            if (mx) {
                if (mx >= THRES)
                    handler(Direction.LEFT, tiles)
                else if (mx <= -THRES)
                    handler(Direction.RIGHT, tiles)
                flag = mx >= THRES || mx <= -THRES;
            }
            else {
                if (my >= THRES)
                    handler(Direction.UP, tiles)
                if (my <= -THRES)
                    handler(Direction.DOWN, tiles)
                flag = my >= THRES || my <= -THRES;
            }
            if (flag) {
                console.log('trigger')
                wheelFired.current = true;
            }
        } else {
            wheelFired.current = false;
        }
    }
    const bind = useGesture({
        onDrag,
        onWheel,
    }, {
        target: attachBody ? document.body : undefined,
    })

    if (!attachBody)
        return bind
}

export default useGestureMove