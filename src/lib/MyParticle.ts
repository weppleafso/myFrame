namespace particle{
    export class MyParticleSystem extends ParticleSystem{
        v:Vec2;
        constructor(texture: egret.Texture, emissionRate: number){
            super(texture,emissionRate);
        }
        public advanceParticle(particle: Particle, dt: number): void {
            particle.y -= dt / 6;
        }
    }
}