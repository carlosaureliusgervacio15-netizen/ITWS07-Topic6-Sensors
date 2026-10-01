import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonLabel, IonRange, IonItem,
  IonBadge, IonIcon
} from '@ionic/angular/standalone';
import { Motion } from '@capacitor/motion';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { diceOutline, phonePortraitOutline, speedometerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonLabel, IonRange, IonItem,
    IonBadge, IonIcon, FormsModule
  ],
})
export class HomePage implements OnInit, OnDestroy {
  diceValue = 1;
  rolling = false;
  shakeDetected = false;
  shakeCount = 0;
  sensitivity = 5;
  lastShake = 'No shake detected yet';
  apiStatus = 'Checking API...';
  apiUrl = '';

  accel = { x: 0, y: 0, z: 0 };
  private motionHandle: any;
  private lastShakeTime = 0;
  private shakeSamples = 0;

  // The phone's current hostname automatically becomes the API host.
  // Example: opening Ionic at http://192.168.1.10:8100 makes the API
  // http://192.168.1.10:3000/api/roll
  private get apiBaseUrl(): string {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:3000/api`;
  }

  constructor() {
    addIcons({ diceOutline, phonePortraitOutline, speedometerOutline });
  }

  async ngOnInit() {
    this.apiUrl = this.apiBaseUrl;
    await this.checkApi();
    await this.startMotion();
  }

  async startMotion() {
    try {
      this.motionHandle = await Motion.addListener('accel', (event) => {
        const a = event.accelerationIncludingGravity;
        this.accel = {
          x: Number(a?.x ?? 0),
          y: Number(a?.y ?? 0),
          z: Number(a?.z ?? 0)
        };

        // At rest, accelerationIncludingGravity is roughly 9.8 m/s².
        // Higher sensitivity = lower amount of movement needed to roll.
        const magnitude = Math.sqrt(
          this.accel.x ** 2 + this.accel.y ** 2 + this.accel.z ** 2
        );
        const movement = Math.abs(magnitude - 9.8);
        const threshold = this.getShakeThreshold();

        if (movement >= threshold) {
          this.shakeSamples++;
          // Require two consecutive motion samples so small sensor spikes
          // do not accidentally roll the die.
          if (this.shakeSamples >= 2) {
            this.shakeSamples = 0;
            this.detectShake(movement);
          }
        } else {
          this.shakeSamples = 0;
        }
      });
    } catch (error) {
      console.error('Motion sensor error:', error);
      this.apiStatus = 'Motion sensor unavailable';
    }
  }

  private getShakeThreshold(): number {
    // Sensitivity 1 = harder shake, 10 = easier shake.
    return 4.5 - (this.sensitivity - 1) * 0.35;
  }

  private async detectShake(movement: number) {
    const now = Date.now();

    // Prevent one physical shake from triggering many rolls.
    if (now - this.lastShakeTime < 800 || this.rolling) return;

    this.lastShakeTime = now;
    this.shakeDetected = true;
    this.shakeCount++;
    this.lastShake = `Shake detected (${movement.toFixed(1)} m/s²)`;

    await this.rollDice();
  }

  async rollDice() {
    if (this.rolling) return;

    this.rolling = true;
    this.shakeDetected = true;

    // Start the visual roll immediately so the user sees the die actually
    // changing faces while the API is generating the final result.
    const animationFaces = [1, 2, 3, 4, 5, 6];
    let frame = 0;
    const rollTimer = window.setInterval(() => {
      this.diceValue = animationFaces[frame % animationFaces.length];
      frame++;
    }, 90);

    try {
      const response = await fetch(`${this.apiBaseUrl}/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sides: 6 })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const finalResult = Number(data.result);

      if (!Number.isInteger(finalResult) || finalResult < 1 || finalResult > 6) {
        throw new Error('Invalid dice result from API');
      }

      // Keep the rolling animation visible for a short moment.
      await new Promise(resolve => setTimeout(resolve, 600));

      // IMPORTANT: the final displayed face always comes directly from the API.
      this.diceValue = finalResult;
      this.apiStatus = `API connected • Roll #${data.rollNumber}`;
    } catch (error) {
      console.error('Dice API error:', error);
      this.apiStatus = 'API offline';
    } finally {
      window.clearInterval(rollTimer);
      this.rolling = false;
      setTimeout(() => this.shakeDetected = false, 500);
    }
  }

  async checkApi() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/status`);
      const data = await response.json();
      this.apiStatus = data.status === 'ok' ? 'API connected' : 'API error';
    } catch {
      this.apiStatus = 'API offline';
    }
  }

  get diceFace(): string {
    return ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][this.diceValue - 1] ?? '⚀';
  }

  ngOnDestroy() {
    this.motionHandle?.remove();
  }
}
