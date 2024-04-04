type Sounds = {
    [Key: string]: HTMLAudioElement
}

export class SoundSystem {
    sounds: Sounds = {};
    _volume: number = 75;

    constructor() {
        this.sounds = {};
    }
    loadSound(name: string, path: string) {
        const newSound = new Audio(path);
        newSound.volume = this._volume / 100;
        this.sounds[name] = newSound;
    }
    playSound(name: string) {
        const sound = this.sounds[name];
        if (sound.ended || sound.paused || sound.currentTime === 0) {
            this.sounds[name].play();
        } else {
            // if the sound is already playing, restart it
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        }
    }
    stopSound(name: string) {
        this.sounds[name].pause();
        this.sounds[name].currentTime = 0;
    }
    setVolume(volume: number) {
        if (this._volume === volume || volume < 0 || volume > 100) return;
        this._volume = volume;
        for (const sound in this.sounds) {
            this.sounds[sound].volume = volume / 100;
        }
    }
}
