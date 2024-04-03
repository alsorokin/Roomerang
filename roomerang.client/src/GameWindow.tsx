import App from './App';
import fieldImg from './assets/night/wall_cyber_NightSky.png';
import borderLongImg from './assets/cyber/canva_cyber_SeaBlue2_Long.png';
import borderLongHorizontalImg from './assets/cyber2/canva_cyber_SeaBlue.png';
import borderLongHorizontal2Img from './assets/cyber2/canva_cyber_SeaBlue2.png';

function GameWindow() {
  return (
      <div className="fieldContainer">
          <div className="gameWindow">
              <App>
                  <img key="field" className="fieldImg" src={fieldImg} />
                  <img key="border-long" className="border-long" src={borderLongImg} />
                  <img key="border-long-horizontal" className="border-long-horizontal" src={borderLongHorizontalImg} />
                  <img key="border-long-horizontal-2" className="border-long-horizontal-2" src={borderLongHorizontal2Img} />
              </App>
              <div className="gameVersion">{process.env.VERSION}</div>
          </div>
      </div>
  );
}

export default GameWindow;
