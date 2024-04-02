const constants = {
    boomerangDiameter: 42,
    appleDiameter: 28,
    appleNextDiameter: 10,
    ballDiameter: 42,
    fieldWidth: 400,
    fieldHeight: 675,
    renderInterval: 15,
    visibleTracerCount: 35,
    tracerDrawDelay: 500,
    tracerDrawEvery: 5,
    aiCheckInterval: 780,
    ballMovementInterval: 9000,
    incapacityDuration: 3000,
    incapacityBlinkInterval: 150,
    baseScoreGain: 2,
    ballHitPenalty: 5,
    momentumCoefficient: 0, // reassigned below
    boomerangInitialY: 0, // reassigned below
    antiboomerangInitialY: 0, // reassigned below
    ballRumbleStartTime: 0, // reassigned below
};

constants.momentumCoefficient = 30000 / constants.renderInterval;
constants.boomerangInitialY = constants.fieldHeight - constants.boomerangDiameter / 2;
constants.antiboomerangInitialY = constants.boomerangDiameter / 2;
constants.ballRumbleStartTime = constants.ballMovementInterval - constants.ballMovementInterval / 6;

export default constants;
