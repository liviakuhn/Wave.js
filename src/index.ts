import { IAnimation } from "./types"
import { Arcs, IArcsOptions } from "./animations/Arcs";
import { Circles, ICirclesOptions } from "./animations/Circles";
import { Cubes, ICubesOptions } from "./animations/Cubes";
import { Flower, IFlowerOptions } from "./animations/Flower";
import { Glob, IGlobOptions } from "./animations/Glob";
import { Lines, ILinesOptions } from "./animations/Lines";
import { Shine, IShineOptions } from "./animations/Shine";
import { Square, ISquareOptions } from "./animations/Square";
import { Turntable, ITurntableOptions } from "./animations/Turntable";
import { Wave as WaveAnimation, IWaveOptions } from "./animations/Wave";

export { IArcsOptions, ICirclesOptions, ICubesOptions, IFlowerOptions, IGlobOptions, ILinesOptions, IShineOptions, ISquareOptions, ITurntableOptions, IWaveOptions };

export class Wave {
    public animations = {
        "Arcs": Arcs,
        "Circles": Circles,
        "Cubes": Cubes,
        "Flower": Flower,
        "Glob": Glob,
        "Lines": Lines,
        "Shine": Shine,
        "Square": Square,
        "Turntable": Turntable,
        "Wave": WaveAnimation
    };
    private _activeAnimations: IAnimation[] = [];
    private _audioStream: MediaStream;
    private _canvasElement: HTMLCanvasElement;
    private _canvasContext: CanvasRenderingContext2D;
    private _audioContext: AudioContext;
    private _audioSource: MediaElementAudioSourceNode;
    private _audioAnalyser: AnalyserNode;

    constructor(audioStream: MediaStream, canvasElement: HTMLCanvasElement) {
        this._audioStream = audioStream;
        this._canvasElement = canvasElement;
        this._canvasContext = this._canvasElement.getContext("2d");

        this._audioContext = new AudioContext();
        this._audioSource = this._audioContext.createMediaStreamSource(this._audioStream);
        this._audioAnalyser = this._audioContext.createAnalyser();
        this._play();
    }

    private _play(): void {
        this._audioSource.connect(this._audioAnalyser);
        const gainNode = this._audioSource.createGain()
        this._audioAnalyser.connect(gainNode)
        gainNode.connect(this._audioContext.destination)
        gainNode.gain.setValueAtTime(0, this._audioContext.currentTime)
        this._audioAnalyser.smoothingTimeConstant = .85;
        this._audioAnalyser.fftSize = 1024;
        let audioBufferData = new Uint8Array(this._audioAnalyser.frequencyBinCount);

        let tick = () => {
            this._audioAnalyser.getByteFrequencyData(audioBufferData);
            this._canvasContext.clearRect(0, 0, this._canvasContext.canvas.width, this._canvasContext.canvas.height);
            this._activeAnimations.forEach((animation) => {
                animation.draw(audioBufferData, this._canvasContext);
            })
            window.requestAnimationFrame(tick);
        }
        tick();
    }

    public addAnimation(animation: IAnimation): void {
        this._activeAnimations.push(animation);
    }

    public clearAnimations(): void {
        this._activeAnimations = [];
    }
}
