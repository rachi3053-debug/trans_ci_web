import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Événements DOM écoutés pour détecter l'activité utilisateur */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'keydown',
  'scroll',
  'touchstart',
  'touchmove',
  'click',
  'focus',
  'wheel',
] as const;

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly inactivityTimeout = 900_000; // 15 minutes
  private readonly warningTimeout = 60_000; // 1 minute avant verrouillage
  private readonly throttleMs = 1_000; // Écart minimum 1 seconde entre enregistrements
  private inactivitySubject = new Subject<void>();
  private warningSubject = new Subject<void>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private lastActivityTime = 0;
  private _isUserActive = true;
  private _warningPhaseActive = false; // Modal d'avertissement affiché - ne pas reset sur activité
  private listenersAttached = false;
  private readonly boundRecordActivity: () => void;

  public timeRemaining = 0;

  constructor(private ngZone: NgZone) {
    this.boundRecordActivity = () => this.recordUserActivity();
  }

  /**
   * Enregistre une activité utilisateur avec throttle de 1 seconde.
   * En phase d'avertissement (modal ouvert), on ignore l'activité pour ne pas
   * annuler le timer de verrouillage - seule l'action "Rester connecté" doit reset.
   */
  recordUserActivity(): void {
    if (this._warningPhaseActive) return;
    const now = Date.now();
    if (now - this.lastActivityTime < this.throttleMs) return;
    this.lastActivityTime = now;
    this.resetInactivityTimer();
  }

  /** Réinitialise les timers. Appelé par activité utilisateur ou par le bouton "Rester connecté". */
  resetInactivityTimer(): void {
    this._warningPhaseActive = false;
    this.markUserActive();
    clearTimeout(this.inactivityTimer!);
    clearTimeout(this.warningTimer!);

    this.warningTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this._warningPhaseActive = true;
        this.warningSubject.next();
      });
    }, this.inactivityTimeout - this.warningTimeout);

    this.inactivityTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this._warningPhaseActive = false;
        this.inactivitySubject.next();
        this.stopAllTimers();
      });
    }, this.inactivityTimeout);

    this.startDisplayTimer();
  }

  /** Relance le timer après déverrouillage */
  markUserActive(): void {
    this._isUserActive = true;
  }

  /** Indique si l'utilisateur est actif (timer en cours) */
  getUserActive(): boolean {
    return this._isUserActive;
  }

  /** Retourne le temps restant en millisecondes */
  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  /** Format M:SS pour affichage */
  getFormattedTimeRemaining(): string {
    const minutes = Math.floor(this.timeRemaining / 60_000);
    const seconds = Math.floor((this.timeRemaining % 60_000) / 1_000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  startInactivityTimer(): void {
    this._isUserActive = true;
    this.attachGlobalListeners();
    this.resetInactivityTimer();
  }

  stopAllTimers(): void {
    this._isUserActive = false;
    this._warningPhaseActive = false;
    clearTimeout(this.inactivityTimer!);
    clearTimeout(this.warningTimer!);
    this.stopDisplayTimer();
    this.detachGlobalListeners();
    this.inactivityTimer = null;
    this.warningTimer = null;
  }

  getInactivityObservable(): Observable<void> {
    return this.inactivitySubject.asObservable();
  }

  getWarningObservable(): Observable<void> {
    return this.warningSubject.asObservable();
  }

  private attachGlobalListeners(): void {
    if (this.listenersAttached || typeof document === 'undefined') return;
    this.listenersAttached = true;

    const passiveOptions = { passive: true, capture: false };
    for (const ev of ACTIVITY_EVENTS) {
      try {
        document.addEventListener(ev, this.boundRecordActivity, passiveOptions);
      } catch {
        document.addEventListener(ev, this.boundRecordActivity);
      }
    }
  }

  private detachGlobalListeners(): void {
    if (!this.listenersAttached || typeof document === 'undefined') return;
    this.listenersAttached = false;

    for (const ev of ACTIVITY_EVENTS) {
      document.removeEventListener(ev, this.boundRecordActivity);
    }
  }

  private startDisplayTimer(): void {
    this.stopDisplayTimer();
    this.timeRemaining = this.inactivityTimeout;
    this.interval = setInterval(() => {
      this.ngZone.run(() => {
        this.timeRemaining = Math.max(0, this.timeRemaining - 1_000);
      });
    }, 1_000);
  }

  private stopDisplayTimer(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.timeRemaining = 0;
  }
}
