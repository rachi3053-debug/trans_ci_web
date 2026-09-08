import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Fonctions utilitaires partagees (transci-ci).
 * Version allegeree du FuncService eFarmOS : supprime les dependances
 * moment / jquery / dropify non disponibles dans l'application.
 */
// @ts-ignore
@Injectable({
  providedIn: 'root'
})
export class FuncService {
  private sharedData: any;
  emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  FILTER_PAG_REGEX = /[^0-9]/g;
  constructor(
    private http: HttpClient
  ) {

  }

  generateAcronym(text: string): string {
    if (!text) return '';
    const words = text.split(/\s+/);
    return words.map(w => w[0]?.toUpperCase()).join('');
  }

  generateRandomCode(prefix: string): string {
    const random = Math.floor(Math.random() * 999) + 1;
    const number = random.toString().padStart(3, '0');
    return `${prefix}-${number}`;
  }

  getInitials(name: string, length: number = 2): string {
    if (!name) return '';

    const words = name.split(' ');
    const initials = words
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join('');

    return initials.substring(0, length);
  }

  getAge(dateNaissance: string | Date): number {
    if (!dateNaissance) return 0;
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  }

  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR') + ' F CFA';
  }

  getFormatDate = (date: any) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getFormatDatewithslash = (date: any) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    date = new Date(date.setDate(date.getDate()));
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  getFormatDatetoAddDay = (date: Date, nombreJour: number) => {
    const initialDate = date.getDate();
    const nbreJourToAdd = Number(nombreJour);
    date = new Date(date.setDate(initialDate + nbreJourToAdd));
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  convertFrDateToEngDate(initialdate: string) {
    const [day, month, year] = initialdate.split('-');
    return `${year}-${month}-${day}`;
  }

  convertEngDateToFrDate(initialdate: string) {
    const [year, month, day] = initialdate.split('-');
    return `${day}-${month}-${year}`;
  }

  convertDatetimetolongDateTime = (date: any) => {
    const options = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  getDaysBetweenDates(startDateStr: string, endDateStr: string): number {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (startDate > endDate) {
      return 0;
    }
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.ceil(diffInDays) + 1;
  }

  getDatesBetween(start: string, end: string): string[] {
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  calculateWorkingDaysExcludingHolidays(datedebut: string, datefin: string, listeJourFerie: any[]): any {
    const start = new Date(datedebut);
    const end = new Date(datefin);
    let count = 0;
    const joursFeriesSet = new Set(
      listeJourFerie.map(jf => new Date(jf.date).toISOString().split('T')[0])
    );
    const joursFeriesExclus: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      const currentDateStr = current.toISOString().split('T')[0];
      if (!joursFeriesSet.has(currentDateStr)) {
        count++;
      } else {
        const jourFerie: any = listeJourFerie.find(
          jf => new Date(jf.date).toISOString().split('T')[0] === currentDateStr
        );
        joursFeriesExclus.push(jourFerie);
      }
      current.setDate(current.getDate() + 1);
    }
    return { nombreJours: count, joursFeriesExclus };
  }

  removeDuplicatesInObjectList(list: any[], property: string): any[] {
    const uniqueMap = new Map<string, any>();
    list.forEach(item => {
      const key = item[property];
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
    return Array.from(uniqueMap.values());
  }

  copyToClipboard = (value: string): any => {
    return navigator.clipboard.writeText(value).then(() => {
    }).catch(err => {
    });
  }

  generatePassword = (length: number = 12): string => {
    if (length < 8 || length > 256) {
      throw new Error("La longueur du mot de passe doit être comprise entre 8 et 256 caractères.");
    }
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allCategories = [lowercase, uppercase, numbers, symbols];
    const selectedCategories = allCategories.sort(() => 0.5 - Math.random()).slice(0, 3);
    let password = '';
    selectedCategories.forEach(category => {
      password += category.charAt(Math.floor(Math.random() * category.length));
    });
    const allCharacters = selectedCategories.join('');
    for (let i = password.length; i < length; i++) {
      password += allCharacters.charAt(Math.floor(Math.random() * allCharacters.length));
    }
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  validatePassword(password: string): boolean {
    if (password.length < 8 || password.length > 256) {
      return false;
    }
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);
    const conditionsMet = [hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;
    return conditionsMet >= 3;
  }

  nombreEnLettres(n: number): string {
    const unites: string[] = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const dizaines: string[] = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];
    const dixNeuf: string[] = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];

    if (n < 10) {
      return unites[n];
    } else if (n < 20) {
      return dixNeuf[n - 10];
    } else if (n < 100) {
      return dizaines[Math.floor(n / 10)] + " " + unites[n % 10];
    } else if (n < 1000) {
      if (n % 100 === 0) {
        return unites[Math.floor(n / 100)] + " cent";
      }
      return unites[Math.floor(n / 100)] + " cent " + this.nombreEnLettres(n % 100);
    } else if (n < 1000000) {
      if (n % 1000 === 0) {
        return this.nombreEnLettres(Math.floor(n / 1000)) + " mille";
      }
      return this.nombreEnLettres(Math.floor(n / 1000)) + " mille " + this.nombreEnLettres(n % 1000);
    } else if (n < 1000000000) {
      if (n % 1000000 === 0) {
        return this.nombreEnLettres(Math.floor(n / 1000000)) + " million";
      }
      return this.nombreEnLettres(Math.floor(n / 1000000)) + " million " + this.nombreEnLettres(n % 1000000);
    }
    return '';
  }

  cleanObject = (obj: any): any => {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    );
  }

  downloadFile(lien: string, filename: string): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', lien);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadFile2(url: string, filename: string): void {
    this.http.get(url, { responseType: 'blob' }).subscribe((blob: any) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    });
  }

  setData(data: any) {
    this.sharedData = data;
    return this.getData();
  }

  getData() {
    return this.sharedData;
  }

  compareDates(date1: Date, date2: Date): number {
    const time1 = date1.getTime();
    const time2 = date2.getTime();
    if (time1 < time2) {
      return -1;
    } else if (time1 > time2) {
      return 1;
    }
    return 0;
  }

  timeToDateTokenExp(_time: any) {
    const unix_timestamp = _time;
    const date = new Date(unix_timestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  supprimerBalises(texte: any) {
    return texte.replace(/<[^>]*>/g, '');
  }
}