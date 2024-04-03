import cnst from './constants';
import { distanceBetweenPoints, calculateMomentumX, calculateMomentumY } from './helpers';

/// Simulate the flight of the boomerang and return if it will hit the apple
/// Currently does not take into account the movement of the ball
/// Also does not check if it hits the ball after hitting the apple
export default function ai(boomX: number, boomY: number, momX: number, momY: number,
        appleX: number, appleY: number, ballX: number, ballY: number): boolean {
    let predictionX = boomX;
    let predictionY = boomY;
    let predictionMomentumX = momX;
    let predictionMomentumY = momY;
    for (let i = 0; i < 500; i++) {
        predictionMomentumX = calculateMomentumX(predictionMomentumX, predictionX);
        predictionX += predictionMomentumX;
        predictionMomentumY = calculateMomentumY(predictionMomentumY, predictionY);
        predictionY += predictionMomentumY;
        if (ballX && ballY && distanceBetweenPoints(predictionX, predictionY, ballX, ballY) < cnst.boomerangDiameter / 2 + cnst.ballDiameter / 2) {
            return false;
        } else if (distanceBetweenPoints(predictionX, predictionY, appleX, appleY) < cnst.boomerangDiameter / 2 + cnst.appleDiameter / 2) {
            return true;
        }
    }
    return false;
}
