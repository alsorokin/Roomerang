type Sounds = {
    [Key: string]: HTMLAudioElement
}

export class SoundSystem {
    sounds: Sounds = { };

    constructor() {
        this.sounds = {};
    }
    loadSound(name: string, path: string) {
        this.sounds[name] = new Audio(path);
    }
    playSound(name: string) {
        if (this.sounds[name].ended || this.sounds[name].paused || this.sounds[name].currentTime === 0) {
            this.sounds[name].play();
        }
    }
    stopSound(name: string) {
        this.sounds[name].pause();
        this.sounds[name].currentTime = 0;
    }
}
