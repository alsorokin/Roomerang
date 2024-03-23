import cnst from './constants';

export function distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function normalizeVector(x: number, y: number): { x: number; y: number } {
    const length = Math.sqrt(x ** 2 + y ** 2);
    return { x: x / length, y: y / length };
}

export function calculateMomentumX(currentMomentum: number, currentPosition: number) {
    return currentMomentum - (currentPosition - cnst.fieldWidth / 2) / cnst.momentumCoefficient;
}

export function calculateMomentumY(currentMomentum: number, currentPosition: number) {
    return currentMomentum - (currentPosition - cnst.fieldHeight / 2) / cnst.momentumCoefficient;
}
