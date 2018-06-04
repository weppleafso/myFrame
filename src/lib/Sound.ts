namespace clib {
    export enum SoundType {
        MUSIC = 1,
        EFFECT = 2,
    };
    class SoundInfo {
        soundChannel: egret.SoundChannel;
        id: number;
        fade: boolean;
        res: string;
        type: SoundType;
        loop: number;
        channel: number;
        isDead: boolean = false;
        constructor(id: number, res: string, fade: boolean, type: SoundType, loop: number) {
            this.res = res;
            this.fade = fade;
            this.type = type;
            this.id = id;
            this.loop = loop;
        }
        setDead() {
            if (this.soundChannel) {
                egret.Tween.removeTweens(this.soundChannel);
                this.soundChannel.stop();
            }
            this.isDead = false;
        }
    }
    var MAX_EFFECT_PLAY = 10;
    export class SoundManager {
        effectCh: { [channel: number]: SoundInfo };
        effectList: SoundInfo[];
        music: SoundInfo;
        id: number;

        flagMute: boolean;
        flagActive: boolean;
        resumeMusic: SoundInfo;

        soundOn: boolean;
        constructor(isMute) {
            this.effectCh = {};
            this.effectList = [];
            this.music = null;
            this.id = 1;
            this.flagMute = isMute;
            this.flagActive = true;
            this.soundOn = !this.flagMute && this.flagActive;
        }
        init() {
            director.instance._stage.addEventListener(egret.Event.ACTIVATE, this.onActive, this);
            director.instance._stage.addEventListener(egret.Event.DEACTIVATE, this.onDeActive, this);
        }
        playMusic(res: string, fade: boolean = false) {
            if (this.music && this.music.res == res) {
                return;
            }
            if (this.music && this.music.res != res) {
                this.stopMusic(() => {
                    this.music = new SoundInfo(this.id++, res, fade, SoundType.MUSIC, 0);
                    RES.getResAsync(res, () => {
                        let sound: egret.Sound = RES.getRes(res);
                        if (this.music && this.music.soundChannel == null && res == this.music.res) {
                            this.music.soundChannel = sound.play(0, 0);
                        }
                    }, this);
                })
            }
            else {
                this.music = new SoundInfo(this.id++, res, fade, SoundType.MUSIC, 0);
                RES.getResAsync(res, () => {
                    if (this.music && this.music.soundChannel == null && res == this.music.res) {
                        let sound: egret.Sound = RES.getRes(res);
                        this.music.soundChannel = sound.play(0, 0);
                    }
                }, this);
            }
        }
        stopMusic(callBack: Function = null) {
            if (this.music) {
                if (this.music.fade) {
                    if (this.music.soundChannel) {
                        egret.Tween.removeTweens(this.music.soundChannel);
                        egret.Tween.get(this.music.soundChannel).to({ volume: 0 }, 1000).call(() => {
                            this.music.setDead();
                            this.music = null;
                            callBack && callBack();
                        })
                    }
                    else {
                        this.music.setDead();
                        this.music = null;
                        callBack && callBack();
                    }

                }
                else {
                    this.music.setDead();
                    this.music = null;
                    callBack && callBack();
                }
            }
            else {
                callBack && callBack();
            }
        }
        public playEffect(res: string, fade: boolean = true, loop: number = 1, channel: number = -1): number {
            if (this.effectList.length > MAX_EFFECT_PLAY) {
                let item = this.effectList.shift();
                this._stopEffectSound(item);
            }
            let item = new SoundInfo(this.id++, res, fade, SoundType.EFFECT, loop);
            item.channel = channel;
            if (channel != -1) {
                if (this.effectCh[channel]) {
                    let index = this.effectList.indexOf(this.effectCh[channel]);
                    if (index != -1) {
                        this.effectList.splice(index, 1);
                    }
                    this._stopEffectSound(this.effectCh[channel]);
                }
            }
            RES.getResAsync(res, () => {
                if (!item.isDead) {
                    let sound: egret.Sound = RES.getRes(res);
                    item.soundChannel = sound.play(0, item.loop);
                    item.soundChannel.addEventListener(egret.Event.SOUND_COMPLETE, this.playSoundEnd, this);
                }
            }, this);
            this.effectList.push(item);
            if (channel != -1) {
                this.effectCh[channel] = item;
            }
            return item.id;
        }
        //播放完成移除掉
        private playSoundEnd(e: egret.Event) {
            let soundChannel = <egret.SoundChannel>e.target;
            let item: SoundInfo;
            for (let i = 0, len = this.effectList.length; i < len; i++) {
                item = this.effectList[i];
                if (item.soundChannel == soundChannel) {
                    this.effectList.splice(i, 1);
                    break;
                }
            }
            if (item) {
                item.fade = false;
                this._stopEffectSound(item);
            }
        }
        private _stopEffectSound(item: SoundInfo) {
            if (item.channel != -1) {
                this.effectCh[item.channel] = null;
            }
            if (item.fade) {
                if (item.soundChannel) {
                    egret.Tween.removeTweens(item.soundChannel);
                    egret.Tween.get(item.soundChannel).to({ volume: 0 }, 1000).call(() => {
                        item.setDead();
                    })
                }
                item.isDead = true;
            }
            else {
                item.setDead();
            }
        }
        public stopEffect(id: number) {
            let item: SoundInfo = null;
            for (let i = 0, len = this.effectList.length; i < len; i++) {
                item = this.effectList[i];
                if (item.id == id) {
                    this.effectList.splice(i, 1);
                    break;
                }
            }
            if (item) {
                this._stopEffectSound(item);
            }
        }
        private stop() {
            this.resumeMusic = this.music;
            this.music.setDead();
            this.music = null;
            for (let i = 0, len = this.effectList.length; i < len; i++) {
                let item = this.effectList[i];
                item.setDead();
            }
            this.effectList.length = 0;
            this.effectCh = {};
        }
        private play() {
            if (this.resumeMusic) {
                this.playMusic(this.resumeMusic.res, this.resumeMusic.fade);
                this.resumeMusic = null;
            }

        }
        private checkFlag() {
            let soundOn = !this.flagMute && this.flagActive;
            if (this.soundOn != soundOn) {
                if (soundOn) {
                    this.play();
                }
                else {
                    this.stop();
                }
                this.soundOn = soundOn;
            }
        }
        onMute(flag: boolean) {
            this.flagMute = flag;
            this.checkFlag();
        }
        onActive() {
            console.log("onActive");
            this.flagActive = true;
            this.checkFlag();
        }
        onDeActive() {
            console.log("onDeActive");
            this.flagActive = false;
            this.checkFlag();
        }
    }
    export var sound: SoundManager;
}