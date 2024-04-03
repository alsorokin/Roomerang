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
}
