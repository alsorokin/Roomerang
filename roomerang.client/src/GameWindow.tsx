import App from './App';
import fieldImg from './assets/night/wall_cyber_NightSky.png';
import borderLongImg from './assets/cyber/canva_cyber_SeaBlue2_Long.png';
import borderLongHorizontalImg from './assets/cyber2/canva_cyber_SeaBlue.png';
import borderLongHorizontal2Img from './assets/cyber2/canva_cyber_SeaBlue2.png';
import { useState } from 'react';
import boomerangContext, { BoomerangContext } from './boomerangContext';

function GameWindow() {
    const [boomContext, setBoomContext] = useState <BoomerangContext>({ paused: false, setPaused: () => { } });
    return (
        <boomerangContext.Provider value={boomContext}>
            <div className="fieldContainer">
                <div className="gameWindow">
                    <input
                        type="button"
                        key="pauseButton"
                        className={boomContext.paused ? "btn pause red" : "btn pause green"}
                        value={boomContext.paused ? "Resume" : "Pause"}
                        onClick={() => boomContext.setPaused(!boomContext.paused)}
                    />
                    <App setBoomContext={setBoomContext}>
                        <img key="field" className="fieldImg" src={fieldImg} />
                        <img key="border-long" className="border-long" src={borderLongImg} />
                        <img key="border-long-horizontal" className="border-long-horizontal" src={borderLongHorizontalImg} />
                        <img key="border-long-horizontal-2" className="border-long-horizontal-2" src={borderLongHorizontal2Img} />
                    </App>
                    <div className="gameVersion">{process.env.VERSION}</div>
                </div>
            </div>
        </boomerangContext.Provider>
    );
}

export default GameWindow;
