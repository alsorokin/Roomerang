import App from './App';
import fieldImg from './assets/night/wall_cyber_NightSky.png';
import borderLongImg from './assets/cyber/canva_cyber_SeaBlue2_Long.png';
import borderLongHorizontalImg from './assets/cyber2/canva_cyber_SeaBlue.png';
import borderLongHorizontal2Img from './assets/cyber2/canva_cyber_SeaBlue2.png';
import { useEffect, useState } from 'react';
import boomerangContext, { BoomerangContext } from './boomerangContext';

function GameWindow() {
    const [boomContext, setBoomContext] = useState<BoomerangContext>({
        paused: false,
        setPaused: () => { },
        soundVolume: 75,
    });

    useEffect(() => {
        let slider = document.querySelector('#slider') as HTMLElement;
        if (!slider) return;
        let thumb = slider.querySelector('#thumb') as HTMLElement;
        if (!thumb) return;

        thumb.addEventListener('mousedown', (event: MouseEvent) => {
            event.preventDefault(); // prevent selection start (browser action)

            let shiftX = event.clientX - thumb.getBoundingClientRect().left;
            // shiftY not needed, the thumb moves only horizontally

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            function onMouseMove(event: MouseEvent) {
                let newLeft = event.clientX - shiftX - slider.getBoundingClientRect().left;

                // the pointer is out of slider => lock the thumb within the bounaries
                if (newLeft < 0) {
                    newLeft = 0;
                }
                const rightEdge = slider.offsetWidth - thumb.offsetWidth;
                if (newLeft > rightEdge) {
                    newLeft = rightEdge;
                }

                thumb.style.left = newLeft + 'px';
                const newVolume = Math.round((newLeft / rightEdge) * 100);
                if (newVolume !== boomContext.soundVolume) {
                    setBoomContext((cntxt) => { return { ...cntxt, soundVolume: newVolume } });
                }
            }

            function onMouseUp() {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }

        });

        thumb.ondragstart = function () {
            return false;
        };

        slider.addEventListener('click', (event: MouseEvent) => {
            let newLeft = event.clientX - slider.getBoundingClientRect().left - thumb.offsetWidth / 2;
            const rightEdge = slider.offsetWidth - thumb.offsetWidth;
            if (newLeft < 0) {
                newLeft = 0;
            }
            if (newLeft > rightEdge) {
                newLeft = rightEdge;
            }
            thumb.style.left = newLeft + 'px';
            const newVolume = Math.round((newLeft / rightEdge) * 100);
            if (newVolume !== boomContext.soundVolume) {
                setBoomContext((cntxt) => { return { ...cntxt, soundVolume: newVolume } });
            }
        });
    }, []);

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
                    <input
                        type="button"
                        key="soundToggleButton"
                        className="btn soundToggle green"
                        value={`Volume: ${boomContext.soundVolume}`}
                        onClick={() => { } } // TODO: Toggle the visibility of the sound slider
                    />
                    <div id="slider" className="slider">
                        <div id="thumb" className="thumb"></div>
                    </div>
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
