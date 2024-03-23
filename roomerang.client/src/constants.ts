const constants = {
    boomerangDiameter: 42,
    appleDiameter: 28,
    appleNextDiameter: 10,
    ballDiameter: 42,
    fieldWidth: 400,
    fieldHeight: 675,
    renderInterval: 5,
    initialBoomerangStyle: { left: '', top: '', animationPlayState: "paused" },
    tracerCount: 60,
    momentumCoefficient: 0, // reassigned below
    boomerangInitialY: 0, // reassigned below
    antiboomerangInitialY: 0, // reassigned below
    aiCheckInterval: 500,
    ballMovementInterval: 15000,
};

constants.momentumCoefficient = 75000 / constants.renderInterval;
constants.boomerangInitialY = constants.fieldHeight - constants.boomerangDiameter / 2;
constants.antiboomerangInitialY = constants.boomerangDiameter / 2;

export default constants;
