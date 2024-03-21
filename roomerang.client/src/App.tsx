import { useRef, useEffect, useState } from 'react';
import './App.css';
import { distanceBetweenPoints, normalizeVector } from './helpers';

const boomerangRadius = 42;
const appleRadius = 28;
const appleNextRadius = 10;
const ballRadius = 42;
const fieldWidth = 400;
const fieldHeight = 675;
const renderInterval = 5;
const momentumCoefficient = 75000 / renderInterval;
const boomerangInitialY = fieldHeight - boomerangRadius / 2;
const antiboomerangInitialY = boomerangRadius / 2;
const initialBoomerangStyle = { left: '', top: '', animationPlayState: "paused" };
const tracerCount = 60;

interface Coords {
    x: number;
    y: number;
}

function App() {
    // Refs
    const boom = useRef<HTMLImageElement | null>(null);
    const antiboom = useRef<HTMLImageElement | null>(null);
    const apple = useRef<HTMLImageElement | null>(null);
    const appleNext = useRef<HTMLImageElement | null>(null);
    const ball = useRef<HTMLImageElement | null>(null);
    const position = useRef({
        boomX: boomerangRadius / 2,
        boomY: boomerangInitialY,
        antiboomX: fieldWidth - boomerangRadius / 2,
        antiboomY: antiboomerangInitialY,
        appleX: -1,
        appleY: -1,
        appleNextX: -1,
        appleNextY: -1,
        ballX: -1,
        ballY: -1,
        ballNextX: fieldWidth / 2,
        ballNextY: fieldHeight / 2,
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
    const ballMoving = useRef(false);
    const score = useRef(0);
    const antiscore = useRef(0);
    const tracerCoords = useRef<Coords[]>([]);
    const drawBoomTracers = useRef(false);
    const drawAntiboomTracers = useRef(false);
    const showTracersTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

    // State
    const [boomerangStyle, setBoomerangStyle] = useState(initialBoomerangStyle);
    const [antiboomerangStyle, setAntiboomerangStyle] = useState(initialBoomerangStyle);
    const [appleStyle, setAppleStyle] = useState({
        left: '',
        top: '',
    });
    const [appleNextStyle, setAppleNextStyle] = useState({
        left: '',
        top: '',
    });
    const [ballStyle, setBallStyle] = useState({
        left: '',
        top: '',
        animationPlayState: 'paused',
        animationDirection: 'normal',
    });
    const [scoreText, setScoreText] = useState('0');
    const [antiscoreText, setAntiscoreText] = useState('0');

    useEffect(() => {
        // Set initial apple position
        position.current.appleX = Math.random() * (fieldWidth - boomerangRadius);
        position.current.appleY = Math.random() * (fieldHeight - boomerangRadius);
        const newAppleStyle = {
            left: position.current.appleX - appleRadius / 2 + 'px',
            top: position.current.appleY - appleRadius / 2 + 'px',
        };
        setAppleStyle(newAppleStyle);
        position.current.appleNextX = Math.random() * (fieldWidth - boomerangRadius);
        position.current.appleNextY = Math.random() * (fieldHeight - boomerangRadius);
        const newAppleNextStyle = {
            left: position.current.appleNextX - appleNextRadius / 2 + 'px',
            top: position.current.appleNextY - appleNextRadius / 2 + 'px',
        };
        setAppleNextStyle(newAppleNextStyle);

        // Set initial ball position
        position.current.ballX = ballRadius + Math.random() * (fieldWidth - ballRadius * 3);
        position.current.ballY = ballRadius * 2 + Math.random() * (fieldHeight - ballRadius * 5);
        const newBallStyle = {
            left: position.current.ballX - ballRadius / 2 + 'px',
            top: position.current.ballY - ballRadius / 2 + 'px',
            animationPlayState: 'paused',
            animationDirection: 'normal',
        };
        setBallStyle(newBallStyle);

        // Occasional ball movement
        let ballMoveTimeout = setTimeout(startMovingBall, 5000);

        // Game loop
        const gameLoop = setInterval(() => {
            if (boom.current === null || antiboom.current == null) return;

            // Move boomerang
            momentum.current.boomX -= (position.current.boomX - fieldWidth / 2) / momentumCoefficient;
            position.current.boomX = position.current.boomX + momentum.current.boomX;
            if (boomerangLaunched.current && position.current.boomY > boomerangInitialY) {
                boomerangLaunched.current = false;
                position.current.boomY = boomerangInitialY;
                momentum.current.boomY = 0;
            }
            else if (boomerangLaunched.current) {
                momentum.current.boomY -= (position.current.boomY - fieldHeight / 2) / momentumCoefficient;
                position.current.boomY += momentum.current.boomY;
            }
            const newBoomerangStyle = {
                left: position.current.boomX - boomerangRadius / 2 + 'px',
                top: position.current.boomY - boomerangRadius / 2 + 'px',
                animationPlayState: boomerangLaunched.current ? 'running' : 'paused',
            };
            setBoomerangStyle(newBoomerangStyle);

            // predict next position of the boomerang and draw tracers there
            const drawEvery = 10;
            if (drawBoomTracers.current && !boomerangLaunched.current) {
                let predictionX = position.current.boomX;
                let predictionY = position.current.boomY;
                let predictionMomentumX = momentum.current.boomX;
                let predictionMomentumY = momentum.current.boomY;
                for (let i = 0; i < tracerCount * drawEvery; i++) {
                    predictionMomentumX -= (predictionX - fieldWidth / 2) / momentumCoefficient;
                    predictionX += predictionMomentumX;
                    predictionMomentumY -= (predictionY - fieldHeight / 2) / momentumCoefficient;
                    predictionY += predictionMomentumY;
                    if (i % drawEvery === 0) {
                        tracerCoords.current[i] = { x: predictionX, y: predictionY };
                    }
                }
            } else if (tracerCoords.current[drawEvery] && tracerCoords.current[drawEvery].x != -10000) {
                for (let i = 0; i < tracerCount * drawEvery; i += drawEvery) {
                    tracerCoords.current[i] = { x: -10000, y: -10000 };
                }
            }

            // Move antiboomerang
            momentum.current.antiboomX -= (position.current.antiboomX - fieldWidth / 2) / momentumCoefficient;
            position.current.antiboomX = position.current.antiboomX + momentum.current.antiboomX;
            if (antiboomerangLaunched.current && position.current.antiboomY < antiboomerangInitialY) {
                antiboomerangLaunched.current = false;
                position.current.antiboomY = antiboomerangInitialY;
                momentum.current.antiboomY = 0;
            }
            else if (antiboomerangLaunched.current) {
                momentum.current.antiboomY -= (position.current.antiboomY - fieldHeight / 2) / momentumCoefficient;
                position.current.antiboomY += momentum.current.antiboomY;
            }
            const newAntiboomerangStyle = {
                left: position.current.antiboomX - boomerangRadius / 2 + 'px',
                top: position.current.antiboomY - boomerangRadius / 2 + 'px',
                animationPlayState: antiboomerangLaunched.current ? 'running' : 'paused',
            };
            setAntiboomerangStyle(newAntiboomerangStyle);

            // Move ball
            if (ballMoving.current) {
                // first, check if ball is close to the target
                const distance = distanceBetweenPoints(position.current.ballX, position.current.ballY, position.current.ballNextX, position.current.ballNextY);
                if (distance < 3) {
                    ballMoving.current = false;
                    momentum.current.ballX = 0;
                    momentum.current.ballY = 0;
                    clearTimeout(ballMoveTimeout);
                    ballMoveTimeout = setTimeout(startMovingBall, 5000);
                }
                position.current.ballX = position.current.ballX + momentum.current.ballX;
                position.current.ballY = position.current.ballY + momentum.current.ballY;
                const newBallStyle = {
                    left: position.current.ballX - ballRadius / 2 + 'px',
                    top: position.current.ballY - ballRadius / 2 + 'px',
                    animationPlayState: ballMoving.current ? 'running' : 'paused',
                    animationDirection: momentum.current.ballX > 0 ? 'normal' : 'reverse',
                };
                setBallStyle(newBallStyle);
            }

            // Check for apple collision
            const boomDistance = distanceBetweenPoints(position.current.boomX, position.current.boomY, position.current.appleX, position.current.appleY);
            const antiboomDistance = distanceBetweenPoints(position.current.antiboomX, position.current.antiboomY, position.current.appleX, position.current.appleY);
            if (boomDistance < boomerangRadius / 2 + appleRadius / 2) {
                resetApple();
                setScoreText((++score.current).toString());
            } else if (antiboomDistance < boomerangRadius / 2 + appleRadius / 2) {
                resetApple();
                setAntiscoreText((++antiscore.current).toString());
            }

            // Check for ball collision
            const boomBallDistance = distanceBetweenPoints(position.current.boomX, position.current.boomY, position.current.ballX, position.current.ballY);
            const antiboomBallDistance = distanceBetweenPoints(position.current.antiboomX, position.current.antiboomY, position.current.ballX, position.current.ballY);
            if (boomBallDistance < boomerangRadius / 2 + ballRadius / 2) {
                startMovingBall();
                resetBoomerang();
                score.current -= 3;
                setScoreText(score.current.toString());
            } else if (antiboomBallDistance < boomerangRadius / 2 + ballRadius / 2) {
                startMovingBall();
                resetAntiboomerang();
                antiscore.current -= 3;
                setAntiscoreText(antiscore.current.toString());
            }

            function resetApple() {
                // put apple to next position
                position.current.appleX = position.current.appleNextX;
                position.current.appleY = position.current.appleNextY;
                const newAppleStyle = {
                    left: position.current.appleX - appleRadius / 2 + 'px',
                    top: position.current.appleY - appleRadius / 2 + 'px',
                };
                setAppleStyle(newAppleStyle);

                // generate next apple position
                position.current.appleNextX = Math.random() * (fieldWidth - boomerangRadius);
                position.current.appleNextY = Math.random() * (fieldHeight - boomerangRadius);
                const newAppleNextStyle = {
                    left: position.current.appleNextX - appleNextRadius / 2 + 'px',
                    top: position.current.appleNextY - appleNextRadius / 2 + 'px',
                };
                setAppleNextStyle(newAppleNextStyle);
            }

            function resetBoomerang() {
                boomerangLaunched.current = false;
                momentum.current.boomY = 0;
                position.current.boomY = fieldHeight - boomerangRadius / 2;
                const newBoomStyle = {
                    left: position.current.boomX + 'px',
                    top: position.current.boomY + 'px',
                    animationPlayState: 'paused',
                };
                setBoomerangStyle(newBoomStyle);
            }

            function resetAntiboomerang() {
                antiboomerangLaunched.current = false;
                momentum.current.antiboomY = 0;
                position.current.antiboomY = boomerangRadius / 2;
                const newAntiboomStyle = {
                    left: position.current.antiboomX + 'px',
                    top: position.current.antiboomY + 'px',
                    animationPlayState: 'paused',
                };
                setAntiboomerangStyle(newAntiboomStyle);
            }

        }, renderInterval);

        function startMovingBall() {
            clearTimeout(ballMoveTimeout);
            ballMoving.current = true;
            position.current.ballNextX = ballRadius + Math.random() * (fieldWidth - ballRadius * 3);
            position.current.ballNextY = ballRadius * 2 + Math.random() * (fieldHeight - ballRadius * 5);
            const vector = normalizeVector(
                position.current.ballNextX - position.current.ballX,
                position.current.ballNextY - position.current.ballY
            );
            momentum.current.ballX = vector.x * 3000 / momentumCoefficient;
            momentum.current.ballY = vector.y * 3000 / momentumCoefficient;
            const newBallStyle = {
                left: position.current.ballX - ballRadius / 2 + 'px',
                top: position.current.ballY - ballRadius / 2 + 'px',
                animationPlayState: 'running',
                animationDirection: momentum.current.ballX > 0 ? 'normal' : 'reverse',
            };
            setBallStyle(newBallStyle);
        }

        return () => {
            clearInterval(gameLoop);
            clearTimeout(ballMoveTimeout);
        };
    }, []);

    function handleFieldClick(event: React.MouseEvent<HTMLDivElement>) {
        const clickYRelative = event.clientY - event.currentTarget.getBoundingClientRect().top;
        if (clickYRelative > fieldHeight / 2) {
            boomerangLaunched.current = true;
        } else {
            antiboomerangLaunched.current = true;
        }
    }

    function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        clearTimeout(showTracersTimeout.current);
        const clickYRelative = event.clientY - event.currentTarget.getBoundingClientRect().top;
        showTracersTimeout.current = setTimeout(() => {
            if (clickYRelative > fieldHeight / 2) {
                drawBoomTracers.current = true;
            } else {
                drawAntiboomTracers.current = true;
            }
        }, 1000);
    }

    function handleMouseRelease() {
        drawBoomTracers.current = false;
        drawAntiboomTracers.current = false;
        clearTimeout(showTracersTimeout.current);
    }

    return (
        <div className="fieldContainer">
            <div className="field" onClick={handleFieldClick} onMouseDown={handleMouseDown} onMouseUp={handleMouseRelease}>
                {
                    tracerCoords.current.map((coords, index) =>
                        <img key={index} className="tracer" style={{ left: coords ? coords.x - 5 + 'px' : '', top: coords ? coords.y - 5 + 'px' : '' }} src="src/assets/tracer_10.png" />
                    )
                }
                <div key="score-bottom" className="score bottom">{scoreText}</div>
                <div key="score-top" className="score top">{antiscoreText}</div>
                <img key="boomerang" ref={boom} className="boom bottom" src="src/assets/boom_bot_42.png" style={boomerangStyle} />
                <img key="antiboomerang" ref={antiboom} className="boom top" src="src/assets/boom_top_42.png" style={antiboomerangStyle} />
                <img key="apple" ref={apple} className="apple" src="src/assets/apple_green_28.png" style={appleStyle} />
                <img key="apple-next" ref={appleNext} className="apple next" src="src/assets/apple_green_28.png" style={appleNextStyle} />
                <img key="ball" ref={ball} className="ball" src="src/assets/ball_42.png" style={ballStyle} />
            </div>
        </div>
    );
}

export default App;
