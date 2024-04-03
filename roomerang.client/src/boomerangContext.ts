import { createContext } from "react";

export type BoomerangContext = {
    paused: boolean;
    setPaused: (paused: boolean) => void;
};

export default createContext<BoomerangContext>({
    paused: false,
    setPaused: () => { }
});
