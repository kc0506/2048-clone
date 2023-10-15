import { ReactNode, createContext, useContext, useEffect } from "react";

type Config = {
    containerSize: [number, number],
    gap: number
    cellSize: number,

    shape: [number, number],
    initVal: number[],
    initTiles: number,
}

const MAX_CONTAINER_SIZE = [600, 450] as const;

const DEFAULTCONFIG: Omit<Config, 'containerSize'> = {
    gap: 14,
    cellSize: 100,
    shape: [4, 4],
    initVal: [5,1, 2],
    initTiles: 4,
}
export { DEFAULTCONFIG }

type Props = {
    children: ReactNode[] | ReactNode,
    config: typeof DEFAULTCONFIG
    setConfig: React.Dispatch<React.SetStateAction<typeof DEFAULTCONFIG>>,
}
const ConfigContext = createContext<{
    config: typeof DEFAULTCONFIG,
    setConfig: React.Dispatch<React.SetStateAction<typeof DEFAULTCONFIG>>,
}>(null!);

function ConfigProvider({ children, config, setConfig }: Props) {
    return <ConfigContext.Provider value={{ config, setConfig }}>
        {children}
    </ConfigContext.Provider>
}
export { ConfigProvider }

function useConfig(): { config: Config } {
    // TODO: modify config

    const { config, setConfig } = useContext(ConfigContext);

    const { gap, cellSize, shape, initTiles } = config;

    // function setCellSize(newCellSize: number) {
    //     newCellSize = Math.min(newCellSize,
    //         (MAX_CONTAINER_SIZE[0] - gap * (shape[0] + 1)) / shape[0],
    //         (MAX_CONTAINER_SIZE[1] - gap * (shape[1] + 1)) / shape[1]
    //     );
    //     setConfig({ ...config, cellSize: newCellSize });
    // }

    // TODO: this should not be placed in effect
    useEffect(() => {
        const newCellSize = Math.min(cellSize,
            (MAX_CONTAINER_SIZE[0] - gap * (shape[0] + 1)) / shape[0],
            (MAX_CONTAINER_SIZE[1] - gap * (shape[1] + 1)) / shape[1]
        );
        setConfig({ ...config, cellSize: newCellSize });
    }, [shape, cellSize]);

    useEffect(() => {
        if (initTiles > shape[0] * shape[1])
            setConfig({ ...config, initTiles })
    }, [initTiles, shape]);

    // console.log(initTiles);


    // console.log(MAX_CONTAINER_SIZE[0] - gap * (shape[0] + 1))
    const containerSize: [number, number] = [
        cellSize * shape[0] + gap * (shape[0] + 1),
        cellSize * shape[1] + gap * (shape[1] + 1),
    ]

    return { config: { containerSize, ...config } };
}

export default useConfig