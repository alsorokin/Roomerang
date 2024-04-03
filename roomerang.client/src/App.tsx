import { useRef, useEffect, useState, CSSProperties, PropsWithChildren } from 'react';
import './App.css';
import { distanceBetweenPoints, normalizeVector, calculateMomentumX, calculateMomentumY, getScoreGain } from './helpers';
import cnst from './constants';
import ai from './ai';

// import image assets
// import boomerangImg from './assets/Bum3.2_42.png';
// import boomerangImg from './assets/cyber/Cyber_bumerang1.png';
//import boomerangImg from './assets/night/Cyber_bumerang5_5.png';
import boomerangImg from './assets/cyber2/Cyber_bumerang6.png';
// import antiboomerangImg from './assets/Bum3.1_42.png';
// import antiboomerangImg from './assets/night/Cyber_bumerang3_3.png';
import antiboomerangImg from './assets/cyber2/Cyber_bumerang7.png';
// import appleImg from './assets/apple_green_28.png';
// import appleImg from './assets/cyber/Cyber_cristal1.png';
import appleImg from './assets/cyber2/Cyber_cristal2.png';
import appleNextImg from './assets/apple_green_28.png';
// import ballImg from './assets/ball_42.png';
// import ballImg from './assets/cyber/Cyber_Butterfl1y.png';
import ballImg from './assets/cyber2/Cyber_Butterfl1y (2).png';
import tracerImg from './assets/tracer_10.png';

// import sound assets
import explosionSound from './assets/sound/explosion.wav';
import boomerangSound from './assets/sound/jump_m_1.wav';
import antiboomerangSound from './assets/sound/jump_m_2.wav';
import boomAppleSound from './assets/sound/coin_m.wav';
import antiboomAppleSound from './assets/sound/synth.wav';

interface Coords {
    x: number;
    y: number;
}

interface FloatingScore {
    coords: Coords;
    score: string;
    opacity: number;
    color: string;
    textSize: number;
    id: number;
}

const initialBoomerangStyle: CSSProperties = { left: '', top: '', animationPlayState: "paused", visibility: 'visible' };

function App({ children }: PropsWithChildren) {
    // Refs
    const boom = useRef<HTMLImageElement | null>(null);
    const antiboom = useRef<HTMLImageElement | null>(null);
    const apple = useRef<HTMLImageElement | null>(null);
    const appleNext = useRef<HTMLImageElement | null>(null);
    const ball = useRef<HTMLImageElement | null>(null);
    const position = useRef({
        boomX: cnst.boomerangDiameter / 2,
        boomY: cnst.boomerangInitialY,
        antiboomX: cnst.fieldWidth - cnst.boomerangDiameter / 2,
        antiboomY: cnst.antiboomerangInitialY,
        appleX: -1,
        appleY: -1,
        appleNextX: -1,
        appleNextY: -1,
        ballX: -1,
        ballY: -1,
        ballNextX: cnst.fieldWidth / 2,
        ballNextY: cnst.fieldHeight / 2,
    });
    const momentum = useRef({
        boomX: 0,
        boomY: 0,
        antiboomX: 0,
        antiboomY: 0,
        ballX: 0,
        ballY: 0,
    });
    const boomerangLaunched = useRef(false);
    const antiboomerangLaunched = useRef(false);
    const boomerangIncapacityRemaining = useRef(0);
    const antiboomerangIncapacityRemaining = useRef(0);
    const ballMoving = useRef(false);
    const score = useRef(0);
    const antiscore = useRef(0);
    const tracerCoords = useRef<Coords[]>([]);
    const drawBoomTracers = useRef(false);
    const drawAntiboomTracers = useRef(false);
    const showTracersTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
    const ticks = useRef(0);
    const lastAiCheck = useRef(0);
    const paused = useRef(false);
    const lastBallMove = useRef(0);
    const tracerDrawCount = useRef(0);
    const floatingScores = useRef<FloatingScore[]>([]);
    const boomerangCombo = useRef(1);
    const antiboomerangCombo = useRef(1);
    const nextFloatingScoreId = useRef(0);
    const antiboomEnabled = useRef(false);
    const ballEnabled = useRef(false);
    const soundEnabled = useRef(true);

    // State
    const [boomerangStyle, setBoomerangStyle] = useState(initialBoomerangStyle);
    const [antiboomerangStyle, setAntiboomerangStyle] = useState(initialBoomerangStyle);
    const [appleStyle, setAppleStyle] = useState<CSSProperties>({
        left: '',
        top: '',
    });
    const [appleNextStyle, setAppleNextStyle] = useState<CSSProperties>({
        left: '',
        top: '',
    });
    const [ballStyle, setBallStyle] = useState <CSSProperties>({
        left: '',
        top: '',
        animationPlayState: 'paused',
        animationDirection: 'normal',
    });
    const [scoreText, setScoreText] = useState('0');
    const [antiscoreText, setAntiscoreText] = useState('0');

    useEffect(() => {
        // Prevent scrolling
        window.addEventListener('ontouchmove', (e) => e.preventDefault());

        // Set initial apple position
        position.current.appleX = cnst.appleDiameter + Math.random() * (cnst.fieldWidth - cnst.appleDiameter * 2);
        position.current.appleY = cnst.appleDiameter + Math.random() * (cnst.fieldHeight - cnst.appleDiameter * 2);
        const newAppleStyle = {
            left: position.current.appleX - cnst.appleDiameter / 2 + 'px',
            top: position.current.appleY - cnst.appleDiameter / 2 + 'px',
        };
        setAppleStyle(newAppleStyle);
        position.current.appleNextX = cnst.appleDiameter + Math.random() * (cnst.fieldWidth - cnst.appleDiameter * 2);
        position.current.appleNextY = cnst.appleDiameter + Math.random() * (cnst.fieldHeight - cnst.appleDiameter * 2);
        const newAppleNextStyle = {
            left: position.current.appleNextX - cnst.appleNextDiameter / 2 + 'px',
            top: position.current.appleNextY - cnst.appleNextDiameter / 2 + 'px',
        };
        setAppleNextStyle(newAppleNextStyle);

        // Set initial ball position
        position.current.ballX = cnst.fieldWidth / 2;
        position.current.ballY = cnst.fieldHeight / 2;
        const newBallStyle: CSSProperties = {
            left: position.current.ballX - cnst.ballDiameter / 2 + 'px',
            top: position.current.ballY - cnst.ballDiameter / 2 + 'px',
            animationPlayState: 'paused',
            animationDirection: 'normal',
            visibility: 'hidden',
        };
        setBallStyle(newBallStyle);

        // Set initial tracer coords
        for (let i = 0; i < cnst.visibleTracerCount * cnst.tracerDrawEvery; i++) {
            tracerCoords.current[i] = { x: -10000, y: -10000 };
        }

        // Game loop
        const gameLoop = setInterval(() => {
            if (boom.current === null || antiboom.current == null) return;
            if (paused.current) return;

            ticks.current += cnst.renderInterval;
            if (boomerangIncapacityRemaining.current >= 0) boomerangIncapacityRemaining.current -= cnst.renderInterval;
            if (antiboomerangIncapacityRemaining.current >= 0) antiboomerangIncapacityRemaining.current -= cnst.renderInterval;

            // Ask AI if we should launch antiboomerang
            if (antiboomEnabled.current &&
                !antiboomerangLaunched.current &&
                antiboomerangIncapacityRemaining.current <= 0 &&
                ticks.current - lastAiCheck.current > cnst.aiCheckInterval)
            {
                lastAiCheck.current = ticks.current;
                const shouldLaunchAntiboomerang = ai(
                    position.current.antiboomX,
                    position.current.antiboomY,
                    momentum.current.antiboomX,
                    momentum.current.antiboomY,
                    position.current.appleX,
                    position.current.appleY,
                    position.current.ballX,
                    position.current.ballY,
                );
                if (shouldLaunchAntiboomerang) {
                    antiboomerangLaunched.current = true;
                    lastAiCheck.current += 7000; // postpone next AI check
                    // play sound
                    if (soundEnabled.current) {
                        const audio = new Audio(antiboomerangSound);
                        audio.play();
                    }
                }
            }

            // Move boomerang
            momentum.current.boomX = calculateMomentumX(momentum.current.boomX, position.current.boomX);
            position.current.boomX += momentum.current.boomX;
            if (boomerangLaunched.current && position.current.boomY > cnst.boomerangInitialY) {
                boomerangLaunched.current = false;
                position.current.boomY = cnst.boomerangInitialY;
                momentum.current.boomY = 0;
                boomerangCombo.current = 1;
            }
            else if (boomerangLaunched.current) {
                momentum.current.boomY = calculateMomentumY(momentum.current.boomY, position.current.boomY);
                position.current.boomY += momentum.current.boomY;
            }

            const boomVisibility = boomerangIncapacityRemaining.current > 0 &&
                Math.floor(boomerangIncapacityRemaining.current / cnst.incapacityBlinkInterval) % 2 === 0 ? 'hidden' : 'visible';
            const newBoomerangStyle: CSSProperties = {
                left: position.current.boomX - cnst.boomerangDiameter / 2 + 'px',
                top: position.current.boomY - cnst.boomerangDiameter / 2 + 'px',
                animationPlayState: boomerangLaunched.current ? 'running' : 'paused',
                visibility: boomVisibility,
            };
            setBoomerangStyle(newBoomerangStyle);

            // predict next position of the boomerang and draw tracers there
            const drawEvery = 5;
            if (drawBoomTracers.current && !boomerangLaunched.current) {
                if (tracerDrawCount.current < cnst.visibleTracerCount) {
                    tracerDrawCount.current += 0.5;
                }
                let predictionX = position.current.boomX;
                let predictionY = position.current.boomY;
                let predictionMomentumX = momentum.current.boomX;
                let predictionMomentumY = momentum.current.boomY;
                for (let i = 0; i < tracerDrawCount.current * drawEvery; i++) {
                    predictionMomentumX = calculateMomentumX(predictionMomentumX, predictionX);
                    predictionX += predictionMomentumX;
                    predictionMomentumY = calculateMomentumY(predictionMomentumY, predictionY);
                    predictionY += predictionMomentumY;
                    if (i % drawEvery === 0) {
                        tracerCoords.current[i] = { x: predictionX, y: predictionY };
                    }
                }
            } else {
                tracerDrawCount.current = 0;
                for (let i = 0; i < cnst.visibleTracerCount * drawEvery; i += drawEvery) {
                    tracerCoords.current[i].x = -10000;
                    tracerCoords.current[i].y = -10000;
                }
            }

            // Move antiboomerang
            if (antiboomEnabled.current) {
                momentum.current.antiboomX = calculateMomentumX(momentum.current.antiboomX, position.current.antiboomX);
                position.current.antiboomX += momentum.current.antiboomX;
                if (antiboomerangLaunched.current && position.current.antiboomY < cnst.antiboomerangInitialY) {
                    antiboomerangLaunched.current = false;
                    position.current.antiboomY = cnst.antiboomerangInitialY;
                    momentum.current.antiboomY = 0;
                    antiboomerangCombo.current = 1;
                }
                else if (antiboomerangLaunched.current) {
                    momentum.current.antiboomY = calculateMomentumY(momentum.current.antiboomY, position.current.antiboomY);
                    position.current.antiboomY += momentum.current.antiboomY;
                }
            }

            const aboomVisibility = !antiboomEnabled.current ||
                (antiboomerangIncapacityRemaining.current > 0 &&
                Math.floor(antiboomerangIncapacityRemaining.current / cnst.incapacityBlinkInterval) % 2 === 0) ?
                'hidden' : 'visible';
            const newAntiboomerangStyle: CSSProperties = {
                left: position.current.antiboomX - cnst.boomerangDiameter / 2 + 'px',
                top: position.current.antiboomY - cnst.boomerangDiameter / 2 + 'px',
                animationPlayState: antiboomerangLaunched.current ? 'running' : 'paused',
                visibility: aboomVisibility,
            };
            // TODO: this might be excessive. only set style when it actually needs to change
            setAntiboomerangStyle(newAntiboomerangStyle);

            // Move ball
            if (ballEnabled.current) {
                if (ballMoving.current) {
                    // first, check if ball is close to the target
                    const distance = distanceBetweenPoints(position.current.ballX, position.current.ballY, position.current.ballNextX, position.current.ballNextY);
                    if (distance < 3) {
                        ballMoving.current = false;
                        momentum.current.ballX = 0;
                        momentum.current.ballY = 0;
                        lastBallMove.current = ticks.current;
                    }
                    position.current.ballX = position.current.ballX + momentum.current.ballX;
                    position.current.ballY = position.current.ballY + momentum.current.ballY;
                    const newBallStyle = {
                        left: position.current.ballX - cnst.ballDiameter / 2 + 'px',
                        top: position.current.ballY - cnst.ballDiameter / 2 + 'px',
                        animationPlayState: ballMoving.current ? 'running' : 'paused',
                        animationDirection: momentum.current.ballX > 0 ? 'normal' : 'reverse',
                    };
                    setBallStyle(newBallStyle);
                } else if (ticks.current - lastBallMove.current > cnst.ballMovementInterval) {
                    // if ball is not moving, check if it's time to move it
                    startMovingBall();
                } else if (ticks.current - lastBallMove.current > cnst.ballRumbleStartTime) {
                    // if ball is not moving, check if it's time to rumble
                    const rumbleX = Math.random() * 2 - 1;
                    const rumbleY = Math.random() * 2 - 1;
                    const newBallStyle = {
                        left: position.current.ballX - cnst.ballDiameter / 2 + rumbleX + 'px',
                        top: position.current.ballY - cnst.ballDiameter / 2 + rumbleY + 'px',
                        animationPlayState: 'paused',
                        animationDirection: 'normal',
                    };
                    setBallStyle(newBallStyle);
                }
            }

            // Update floating scores
            updateFloatingScores();

            // Check for apple collision
            if (boomerangIncapacityRemaining.current <= 0) {
                const boomDistance = distanceBetweenPoints(position.current.boomX, position.current.boomY, position.current.appleX, position.current.appleY);
                if (boomDistance < cnst.boomerangDiameter / 2 + cnst.appleDiameter / 2) {
                    const scoreToAdd = getScoreGain(boomerangCombo.current);
                    addFloatingScore(position.current.appleX, position.current.appleY,
                        scoreToAdd, "mediumpurple", boomerangCombo.current);
                    if (boomerangLaunched.current) {
                        boomerangCombo.current++;
                    }
                    resetApple();
                    score.current += scoreToAdd;
                    setScoreText((score.current).toString());
                    // play sound
                    if (soundEnabled.current) {
                        const audio = new Audio(boomAppleSound);
                        audio.play();
                    }
                }
            }

            if (antiboomEnabled.current && antiboomerangIncapacityRemaining.current <= 0) {
                const antiboomDistance = distanceBetweenPoints(position.current.antiboomX, position.current.antiboomY, position.current.appleX, position.current.appleY);
                if (antiboomDistance < cnst.boomerangDiameter / 2 + cnst.appleDiameter / 2) {
                    const scoreToAdd = getScoreGain(antiboomerangCombo.current);
                    addFloatingScore(position.current.appleX, position.current.appleY,
                        scoreToAdd, "red", antiboomerangCombo.current);
                    if (antiboomerangLaunched.current) {
                        antiboomerangCombo.current++;
                    }
                    resetApple();
                    antiscore.current += scoreToAdd;
                    setAntiscoreText((antiscore.current).toString());
                    // play sound
                    if (soundEnabled.current) {
                        const audio = new Audio(antiboomAppleSound);
                        audio.play();
                    }
                }
            }

            // Check for ball collision
            if (ballEnabled.current) {
                const boomBallDistance = distanceBetweenPoints(position.current.boomX, position.current.boomY, position.current.ballX, position.current.ballY);
                if (boomBallDistance < cnst.boomerangDiameter / 2 + cnst.ballDiameter / 2) {
                    addFloatingScore(position.current.ballX, position.current.ballY, -cnst.ballHitPenalty, "mediumpurple", 3);
                    startMovingBall();
                    resetBoomerang();
                    score.current -= cnst.ballHitPenalty;
                    boomerangCombo.current = 1;
                    setScoreText(score.current.toString());
                    boomerangIncapacityRemaining.current = cnst.incapacityDuration;
                    // play sound
                    if (soundEnabled.current) {
                        const audio = new Audio(explosionSound);
                        audio.play();
                    }
                } else if (antiboomEnabled.current &&
                    distanceBetweenPoints(
                        position.current.antiboomX,
                        position.current.antiboomY,
                        position.current.ballX,
                        position.current.ballY) < cnst.boomerangDiameter / 2 + cnst.ballDiameter / 2) {
                    addFloatingScore(position.current.ballX, position.current.ballY, -cnst.ballHitPenalty, "red", 3);
                    startMovingBall();
                    resetAntiboomerang();
                    antiscore.current -= cnst.ballHitPenalty;
                    antiboomerangCombo.current = 1;
                    setAntiscoreText(antiscore.current.toString());
                    antiboomerangIncapacityRemaining.current = cnst.incapacityDuration;
                    // play sound
                    if (soundEnabled.current) {
                        const audio = new Audio(explosionSound);
                        audio.play();
                    }
                }
            }

            function resetApple() {
                // put apple to next position
                position.current.appleX = position.current.appleNextX;
                position.current.appleY = position.current.appleNextY;
                const newAppleStyle = {
                    left: position.current.appleX - cnst.appleDiameter / 2 + 'px',
                    top: position.current.appleY - cnst.appleDiameter / 2 + 'px',
                };
                setAppleStyle(newAppleStyle);

                // generate next apple position
                position.current.appleNextX = cnst.appleDiameter + Math.random() * (cnst.fieldWidth - cnst.appleDiameter * 2);
                position.current.appleNextY = cnst.appleDiameter + Math.random() * (cnst.fieldHeight - cnst.appleDiameter * 2);
                const newAppleNextStyle = {
                    left: position.current.appleNextX - cnst.appleNextDiameter / 2 + 'px',
                    top: position.current.appleNextY - cnst.appleNextDiameter / 2 + 'px',
                };
                setAppleNextStyle(newAppleNextStyle);
            }

            function resetBoomerang() {
                boomerangLaunched.current = false;
                momentum.current.boomY = 0;
                position.current.boomY = cnst.fieldHeight - cnst.boomerangDiameter / 2;
                const newBoomStyle: CSSProperties = {
                    left: position.current.boomX + 'px',
                    top: position.current.boomY + 'px',
                    animationPlayState: 'paused',
                    visibility: 'visible',
                };
                setBoomerangStyle(newBoomStyle);
            }

            function resetAntiboomerang() {
                antiboomerangLaunched.current = false;
                momentum.current.antiboomY = 0;
                position.current.antiboomY = cnst.boomerangDiameter / 2;
                const newAntiboomStyle: CSSProperties = {
                    left: position.current.antiboomX + 'px',
                    top: position.current.antiboomY + 'px',
                    animationPlayState: 'paused',
                    visibility: 'visible',
                };
                setAntiboomerangStyle(newAntiboomStyle);
            }

        }, cnst.renderInterval);

        function startMovingBall() {
            ballMoving.current = true;
            position.current.ballNextX = cnst.ballDiameter + Math.random() * (cnst.fieldWidth - cnst.ballDiameter * 3);
            position.current.ballNextY = cnst.ballDiameter * 2 + Math.random() * (cnst.fieldHeight - cnst.ballDiameter * 5);
            const vector = normalizeVector(
                position.current.ballNextX - position.current.ballX,
                position.current.ballNextY - position.current.ballY
            );
            momentum.current.ballX = vector.x * 3000 / cnst.momentumCoefficient;
            momentum.current.ballY = vector.y * 3000 / cnst.momentumCoefficient;
            const newBallStyle = {
                left: position.current.ballX - cnst.ballDiameter / 2 + 'px',
                top: position.current.ballY - cnst.ballDiameter / 2 + 'px',
                animationPlayState: 'running',
                animationDirection: momentum.current.ballX > 0 ? 'normal' : 'reverse',
            };
            setBallStyle(newBallStyle);
        }

        function addFloatingScore(x: number, y: number, score: number, color: string, combo: number = 1) {
            const scoreText = score > 0 ? '+' + score : score.toString();
            const xCorrection = scoreText.length * 3 + combo * 8;
            const yCorrection = 19 + combo * 8;
            floatingScores.current.push({
                coords: { x: x - xCorrection, y: y - yCorrection },
                score: scoreText,
                opacity: 1,
                color: color,
                textSize: 14 + combo * 8,
                id: nextFloatingScoreId.current++,
            });
        }

        function updateFloatingScores() {
            for (let i = floatingScores.current.length - 1; i >= 0; i--) {
                floatingScores.current[i].opacity -= 0.005;
                if (floatingScores.current[i].opacity <= 0) {
                    floatingScores.current.splice(i, 1);
                }
            }
        }

        return () => {
            clearInterval(gameLoop);
            clearTimeout(showTracersTimeout.current);
        };
    }, []);

    function handleFieldClick() {
        if (paused.current) return;
        if (!boomerangLaunched.current && boomerangIncapacityRemaining.current <= 0) {
            boomerangLaunched.current = true;
            // play sound
            if (soundEnabled.current) {
                const audio = new Audio(boomerangSound);
                audio.play();
            }
        }
    }

    function handleMouseDown(e: React.MouseEvent | React.TouchEvent) {
        if (paused.current) return;
        clearTimeout(showTracersTimeout.current);
        showTracersTimeout.current = setTimeout(() => {
                drawBoomTracers.current = true;
        }, cnst.tracerDrawDelay);
        e.preventDefault();
    }

    function handleMouseRelease() {
        if (paused.current) return;
        drawBoomTracers.current = false;
        drawAntiboomTracers.current = false;
        clearTimeout(showTracersTimeout.current);
    }

    function pauseGame() {
        paused.current = true;
        const newBoomerangStyle: CSSProperties = {
            top: position.current.boomY - cnst.boomerangDiameter / 2,
            left: position.current.boomX - cnst.boomerangDiameter / 2,
            animationPlayState: 'paused',
        };
        setBoomerangStyle(newBoomerangStyle);
        const newAntiboomerangStyle: CSSProperties = {
            top: position.current.antiboomY - cnst.boomerangDiameter / 2,
            left: position.current.antiboomX - cnst.boomerangDiameter / 2,
            animationPlayState: 'paused',
            visibility: antiboomEnabled.current ? 'visible' : 'hidden',
        };
        setAntiboomerangStyle(newAntiboomerangStyle);
        const newBallStyle: CSSProperties = {
            top: position.current.ballY - cnst.ballDiameter / 2,
            left: position.current.ballX - cnst.ballDiameter / 2,
            animationPlayState: 'paused',
            visibility: ballEnabled.current ? 'visible' : 'hidden',
        };
        setBallStyle(newBallStyle);
    }

    function unpauseGame() {
        paused.current = false;
    }

    function enableAntiboomerang() {
        antiboomEnabled.current = true;
        position.current.antiboomX = cnst.fieldWidth - position.current.boomX;
        momentum.current.antiboomX = -momentum.current.boomX;
        position.current.antiboomY = cnst.antiboomerangInitialY;
        momentum.current.antiboomY = 0;
        antiboomerangLaunched.current = false;
    }

    function disableAntiboomerang() {
        antiboomEnabled.current = false;
    }

    function enableBall() {
        ballEnabled.current = true;
        position.current.ballX = cnst.fieldWidth / 2;
        position.current.ballY = cnst.fieldHeight / 2;
        const newBallStyle: CSSProperties = {
            left: position.current.ballX - cnst.ballDiameter / 2 + 'px',
            top: position.current.ballY - cnst.ballDiameter / 2 + 'px',
            animationPlayState: 'paused',
            animationDirection: 'normal',
            visibility: 'visible',
        };
        setBallStyle(newBallStyle);
        lastBallMove.current = ticks.current;
    }

    function disableBall() {
        ballEnabled.current = false;
        const newBallStyle: CSSProperties = {
            animationPlayState: 'paused',
            visibility: 'hidden',
        };
        setBallStyle(newBallStyle);
    }

    return (
        <>
            <div className="field"
                onClick={handleFieldClick}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onMouseUp={handleMouseRelease}
                onTouchEnd={() => { handleMouseRelease(); handleFieldClick(); }}
            >
                {children}
                {
                    tracerCoords.current.map((coords, index) =>
                        <img key={`tracer-${index}`}
                            className="tracer"
                            style={{ left: coords ? coords.x + 'px' : '', top: coords ? coords.y + 'px' : '' }}
                            src={tracerImg} />
                    )
                }
                <div key="score-bottom" className="score bottom">{scoreText}</div>
                <div key="score-top" className="score top" style={{ visibility: antiboomEnabled.current ? 'visible' : 'hidden' }}>{antiscoreText}</div>
                <img key="boomerang" ref={boom} className="boom bottom" src={boomerangImg} style={boomerangStyle} />
                <img key="antiboomerang" ref={antiboom} className="boom top" src={antiboomerangImg} style={antiboomerangStyle} />
                <img key="apple" ref={apple} className="apple" src={appleImg} style={appleStyle} />
                <img key="apple-next" ref={appleNext} className="apple next" src={appleNextImg} style={appleNextStyle} />
                <img key="ball" ref={ball} className="ball" src={ballImg} style={ballStyle} />
                {
                    floatingScores.current.map((fs) =>
                        <div key={`floating-score-${fs.id}`}
                            className="score fading"
                            style={{
                                top: fs.coords.y + "px",
                                left: fs.coords.x + "px",
                                color: fs.color,
                                fontSize: fs.textSize + "px",
                            }}>{fs.score}</div>
                    )
                }
            </div>
            <input
                type="button"
                key="pauseButton"
                className={paused.current ? "btn pause red" : "btn pause green"}
                value={paused.current ? "Unpause" : "Pause"}
                onClick={() => paused.current ? unpauseGame() : pauseGame()}
            />
            <input
                type="button"
                key="aboomToggleButton"
                className={antiboomEnabled.current ? "btn aboomToggle green" : "btn aboomToggle red"}
                value={antiboomEnabled.current ? "Disable top boomerang" : "Enable top boomerang"}
                onClick={() => antiboomEnabled.current ? disableAntiboomerang() : enableAntiboomerang()}
            />
            <input
                type="button"
                key="ballToggleButton"
                className={ballEnabled.current ? "btn ballToggle green" : "btn ballToggle red"}
                value={ballEnabled.current ? "Disable ball" : "Enable ball"}
                onClick={() => ballEnabled.current ? disableBall() : enableBall()}
            />
            <input
                type="button"
                key="soundToggleButton"
                className={soundEnabled.current ? "btn soundToggle green" : "btn soundToggle red"}
                value={soundEnabled.current ? "Disable sound" : "Enable sound"}
                onClick={() => soundEnabled.current = !soundEnabled.current}
            />
        </>
    );
}

export default App;
