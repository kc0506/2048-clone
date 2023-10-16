import { ReactNode, createContext, useContext, useEffect, useState } from "react";

type Config = {
    containerSize: [number, number],
    gap: number
    cellSize: number,

    shape: [number, number],
    initVal: number[],
    initTiles: number,
}


const DEFAULTCONFIG: Omit<Config, 'containerSize'> = {
    gap: 14,
    cellSize: 100,
    shape: [4, 4],
    initVal: [1, 2],
    initTiles: 4,
}
export { DEFAULTCONFIG }

const ConfigContext = createContext<{
    config: typeof DEFAULTCONFIG,
    setConfig: React.Dispatch<React.SetStateAction<typeof DEFAULTCONFIG>>,
} | null>(null);

type Props = { children: ReactNode[] | ReactNode, }
function ConfigProvider({ children, }: Props) {

    const [config, setConfig] = useState(DEFAULTCONFIG);

    return <ConfigContext.Provider value={{ config, setConfig }}>
        {children}
    </ConfigContext.Provider>
}
export { ConfigProvider }

function useConfig(): { config: Config } {
    // TODO: modify config

    const MAX_CONTAINER_SIZE = [Math.min(600, document.body.clientWidth), 450] as const;

    const context = useContext(ConfigContext);
    if (!context)
        throw Error('ConfigContext used outside provider.')

    const { config, setConfig } = context;

    const { gap, cellSize, shape, initTiles } = config;

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

    const containerSize: [number, number] = [
        cellSize * shape[0] + gap * (shape[0] + 1),
        cellSize * shape[1] + gap * (shape[1] + 1),
    ]

    return { config: { containerSize, ...config } };
}

export default useConfig