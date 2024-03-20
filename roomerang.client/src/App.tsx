import { useRef, useEffect, useState } from 'react';
import './App.css';
import { distanceBetweenPoints } from './helpers';

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
    });
    const momentum = useRef({
        boomX: 0,
        boomY: 0,
        antiboomX: 0,
        antiboomY: 0,
    });
    const boomerangLaunched = useRef(false);
    const antiboomerangLaunched = useRef(false);
    const score = useRef(0);
    const antiscore = useRef(0);

    // State
    const [boomerangStyle, setBoomerangStyle] = useState(initialBoomerangStyle);
    const [antiboomerangStyle, setAntiboomerangStyle] = useState(initialBoomerangStyle);
    const [appleStyle, setAppleStyle] = useState({ left: '', top: '' });
    const [appleNextStyle, setAppleNextStyle] = useState({ left: '', top: '' });
    const [ballStyle, setBallStyle] = useState({ left: '', top: '' });
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
        position.current.ballY = ballRadius + Math.random() * (fieldHeight - ballRadius * 3);
        const newBallStyle = {
            left: position.current.ballX - ballRadius / 2 + 'px',
            top: position.current.ballY - ballRadius / 2 + 'px',
        };
        setBallStyle(newBallStyle);

        // Game loop
        let interval = setInterval(() => {
            if (boom.current === null || antiboom.current == null) return;

            // Move boomerang
            momentum.current.boomX += -((position.current.boomX - fieldWidth / 2) / momentumCoefficient);
            position.current.boomX = position.current.boomX + momentum.current.boomX;
            if (boomerangLaunched.current && position.current.boomY > boomerangInitialY) {
                boomerangLaunched.current = false;
                position.current.boomY = boomerangInitialY;
                momentum.current.boomY = 0;
            }
            else if (boomerangLaunched.current) {
                momentum.current.boomY += -((position.current.boomY - fieldHeight / 2) / momentumCoefficient);
                position.current.boomY = position.current.boomY + momentum.current.boomY;
            }
            const newBoomerangStyle = {
                left: position.current.boomX - boomerangRadius / 2 + 'px',
                top: position.current.boomY - boomerangRadius / 2 + 'px',
                animationPlayState: boomerangLaunched.current ? 'running' : 'paused',
            };
            setBoomerangStyle(newBoomerangStyle);

            // Move antiboomerang
            momentum.current.antiboomX += -((position.current.antiboomX - fieldWidth / 2) / momentumCoefficient);
            position.current.antiboomX = position.current.antiboomX + momentum.current.antiboomX;
            if (antiboomerangLaunched.current && position.current.antiboomY < antiboomerangInitialY) {
                antiboomerangLaunched.current = false;
                position.current.antiboomY = antiboomerangInitialY;
                momentum.current.antiboomY = 0;
            }
            else if (antiboomerangLaunched.current) {
                momentum.current.antiboomY += -((position.current.antiboomY - fieldHeight / 2) / momentumCoefficient);
                position.current.antiboomY = position.current.antiboomY + momentum.current.antiboomY;
            }
            const newAntiboomerangStyle = {
                left: position.current.antiboomX - boomerangRadius / 2 + 'px',
                top: position.current.antiboomY - boomerangRadius / 2 + 'px',
                animationPlayState: antiboomerangLaunched.current ? 'running' : 'paused',
            };
            setAntiboomerangStyle(newAntiboomerangStyle);

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
                resetBall();
                resetBoomerang();
                score.current -= 3;
                setScoreText(score.current.toString());
            } else if (antiboomBallDistance < boomerangRadius / 2 + ballRadius / 2) {
                resetBall();
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

            function resetBall() {
                position.current.ballX = ballRadius + Math.random() * (fieldWidth - ballRadius * 3);
                position.current.ballY = ballRadius + Math.random() * (fieldHeight - ballRadius * 3);
                const newBallStyle = {
                    left: position.current.ballX - ballRadius / 2 + 'px',
                    top: position.current.ballY - ballRadius / 2 + 'px',
                };
                setBallStyle(newBallStyle);
            }

            function resetBoomerang() {
                boomerangLaunched.current = false;
                momentum.current.boomY = 0;
                position.current.boomY = fieldHeight - boomerangRadius / 2;
                const newBoomStyle = {
                    left: position.current.boomX + 'px',
                    top: position.current.boomY + 'px',
                    animationPlayState: 'paused'
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
                    animationPlayState: 'paused'
                };
                setAntiboomerangStyle(newAntiboomStyle);
            }

        }, renderInterval);
        return () => clearInterval(interval);
    }, []);

    function handleFieldClick(event: React.MouseEvent<HTMLDivElement>) {
        const clickYRelative = event.clientY - event.currentTarget.getBoundingClientRect().top;
        if (clickYRelative > fieldHeight / 2) {
            boomerangLaunched.current = true;
        } else {
            antiboomerangLaunched.current = true;
        }
    }

    return (
        <div className="fieldContainer">
            <div className="field" onClick={handleFieldClick}>
                <div className="score bottom">{scoreText}</div>
                <div className="score top">{antiscoreText}</div>
                <img ref={boom} className="boom bottom" src="src/assets/boom_bot_42.png" style={boomerangStyle} />
                <img ref={antiboom} className="boom top" src="src/assets/boom_top_42.png" style={antiboomerangStyle} />
                <img ref={apple} className="apple" src="src/assets/apple_green_28.png" style={appleStyle} />
                <img ref={appleNext} className="apple next" src="src/assets/apple_green_28.png" style={appleNextStyle} />
                <img ref={ball} className="ball" src="src/assets/ball_42.png" style={ballStyle} />
            </div>
        </div>
    );
}

export default App;
