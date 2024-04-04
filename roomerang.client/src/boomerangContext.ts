import { createContext } from "react";

export type BoomerangContext = {
    paused: boolean;
    setPaused: (paused: boolean) => void;
    soundVolume: number;
};

export default createContext<BoomerangContext>({
    paused: false,
    setPaused: () => { },
    soundVolume: 75,
});
