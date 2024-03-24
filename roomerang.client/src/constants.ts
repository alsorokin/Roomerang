const constants = {
    boomerangDiameter: 42,
    appleDiameter: 28,
    appleNextDiameter: 10,
    ballDiameter: 42,
    fieldWidth: 400,
    fieldHeight: 675,
    renderInterval: 15,
    tracerCount: 35,
    tracerDrawDelay: 500,
    tracerDrawEvery: 5,
    momentumCoefficient: 0, // reassigned below
    boomerangInitialY: 0, // reassigned below
    antiboomerangInitialY: 0, // reassigned below
    aiCheckInterval: 780,
    ballMovementInterval: 15000,
    incapacityDuration: 3000,
    incapacityBlinkInterval: 150,
};

constants.momentumCoefficient = 30000 / constants.renderInterval;
constants.boomerangInitialY = constants.fieldHeight - constants.boomerangDiameter / 2;
constants.antiboomerangInitialY = constants.boomerangDiameter / 2;

export default constants;
