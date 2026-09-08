import { LocalStorageService } from '@/app/partager/local.service';
import { changetheme } from '@/store/layout/layout-action';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

@Injectable({
    providedIn: 'root'
})
export class TimeThemeService {
    private intervalId: any;
    private readonly DARK_MODE_TIME = '18:30'; // 6:30 PM
    private readonly LIGHT_MODE_TIME = '06:30'; // 6:30 AM
    private readonly AUTO_THEME_KEY = 'autoThemeEnabled';

    constructor(
        private store: Store,
        private localStorageService: LocalStorageService
    ) { }

    /**
     * Start the automatic theme switching based on time
     */
    startAutoThemeSwitching(): void {
        // Clear any existing interval
        this.stopAutoThemeSwitching();

        // Check theme immediately
        this.checkAndSwitchTheme();

        // Set up interval to check every minute
        this.intervalId = setInterval(() => {
            this.checkAndSwitchTheme();
        }, 60000); // Check every minute
    }

    /**
     * Stop the automatic theme switching
     */
    stopAutoThemeSwitching(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Check current time and switch theme if needed
     */
    private checkAndSwitchTheme(): void {
        if (!this.isAutoThemeEnabled()) {
            return;
        }

        const currentTime = this.getCurrentTime();
        const currentTheme = this.getCurrentTheme();

        // Check if it's time for dark mode (18:30 to 06:30 next day)
        if (this.shouldBeDarkMode(currentTime)) {
            if (currentTheme !== 'dark') {
                console.log('🌙 Auto-switching to dark mode at', currentTime);
                this.store.dispatch(changetheme({ color: 'dark' }));
                this.localStorageService.setJsonValue('theme', 'dark');
            }
        }
        // Check if it's time for light mode (06:30 to 18:30)
        else if (this.shouldBeLightMode(currentTime)) {
            if (currentTheme !== 'light') {
                console.log('☀️ Auto-switching to light mode at', currentTime);
                this.store.dispatch(changetheme({ color: 'light' }));
                this.localStorageService.setJsonValue('theme', 'light');
            }
        }
    }

    /**
     * Check if current time should be dark mode
     * Dark mode: 18:30 to 06:30 next day
     */
    private shouldBeDarkMode(currentTime: string): boolean {
        const currentHour = parseInt(currentTime.split(':')[0]);
        const currentMinute = parseInt(currentTime.split(':')[1]);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const darkModeStart = 18 * 60 + 30; // 18:30 in minutes
        const darkModeEnd = 6 * 60 + 30;   // 06:30 in minutes

        // Dark mode is active from 18:30 to 06:30 next day
        return currentTimeInMinutes >= darkModeStart || currentTimeInMinutes < darkModeEnd;
    }

    /**
     * Check if current time should be light mode
     * Light mode: 06:30 to 18:30
     */
    private shouldBeLightMode(currentTime: string): boolean {
        const currentHour = parseInt(currentTime.split(':')[0]);
        const currentMinute = parseInt(currentTime.split(':')[1]);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const lightModeStart = 6 * 60 + 30;  // 06:30 in minutes
        const lightModeEnd = 18 * 60 + 30;   // 18:30 in minutes

        // Light mode is active from 06:30 to 18:30
        return currentTimeInMinutes >= lightModeStart && currentTimeInMinutes < lightModeEnd;
    }

    /**
     * Get current time in HH:MM format
     */
    private getCurrentTime(): string {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Get current theme from DOM
     */
    private getCurrentTheme(): string {
        return document.documentElement.getAttribute('data-bs-theme') || 'light';
    }

    /**
     * Check if auto theme switching is enabled
     */
    isAutoThemeEnabled(): boolean {
        return this.localStorageService.getJsonValue(this.AUTO_THEME_KEY) === true;
    }

    /**
     * Enable auto theme switching
     */
    enableAutoTheme(): void {
        this.localStorageService.setJsonValue(this.AUTO_THEME_KEY, true);
        this.startAutoThemeSwitching();
    }

    /**
     * Disable auto theme switching
     */
    disableAutoTheme(): void {
        this.localStorageService.setJsonValue(this.AUTO_THEME_KEY, false);
        this.stopAutoThemeSwitching();
    }

    /**
     * Toggle auto theme switching
     */
    toggleAutoTheme(): boolean {
        const isEnabled = this.isAutoThemeEnabled();
        if (isEnabled) {
            this.disableAutoTheme();
        } else {
            this.enableAutoTheme();
        }
        return !isEnabled;
    }

    /**
     * Get the next theme switch time
     */
    getNextThemeSwitchTime(): string {
        const currentTime = this.getCurrentTime();
        const currentHour = parseInt(currentTime.split(':')[0]);
        const currentMinute = parseInt(currentTime.split(':')[1]);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const darkModeStart = 18 * 60 + 30; // 18:30 in minutes
        const lightModeStart = 6 * 60 + 30; // 06:30 in minutes

        if (this.shouldBeDarkMode(currentTime)) {
            // Currently in dark mode, next switch is to light mode at 06:30
            return '06:30';
        } else {
            // Currently in light mode, next switch is to dark mode at 18:30
            return '18:30';
        }
    }

    /**
     * Get time until next theme switch
     */
    getTimeUntilNextSwitch(): string {
        const currentTime = this.getCurrentTime();
        const nextSwitchTime = this.getNextThemeSwitchTime();

        const currentHour = parseInt(currentTime.split(':')[0]);
        const currentMinute = parseInt(currentTime.split(':')[1]);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const nextHour = parseInt(nextSwitchTime.split(':')[0]);
        const nextMinute = parseInt(nextSwitchTime.split(':')[1]);
        let nextTimeInMinutes = nextHour * 60 + nextMinute;

        // If next switch is tomorrow (for dark mode end)
        if (nextSwitchTime === '06:30' && this.shouldBeDarkMode(currentTime)) {
            nextTimeInMinutes += 24 * 60; // Add 24 hours
        }

        const minutesUntilSwitch = nextTimeInMinutes - currentTimeInMinutes;
        const hours = Math.floor(minutesUntilSwitch / 60);
        const minutes = minutesUntilSwitch % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
}
