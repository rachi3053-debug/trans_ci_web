import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../../core/auth/models/user.model';
import { UserDataService } from './user.data.service';

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  password: string;
  roleCodes?: string[];
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  actif?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserMetier {
  private readonly data = inject(UserDataService);

  getAllUsers(): Observable<User[]> {
    return this.data.getAll();
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.data.create({
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email,
      telephone: payload.telephone,
      password: payload.password,
      actif: true,
    });
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.data.update(id, payload);
  }

  toggleActive(user: User): Observable<User> {
    return this.data.update(user.id, { actif: !user.actif });
  }

  deleteUser(id: string): Observable<void> {
    return this.data.delete(id);
  }

  assignRoles(id: string, roleCodes: string[]): Observable<User> {
    return this.data.assignRoles(id, roleCodes);
  }

  getUserRoles(id: string): Observable<{ id: string; code: string; libelle: string }[]> {
    return this.data.getRoles(id);
  }

  setPassword(id: string, password: string): Observable<User> {
    return this.data.setPassword(id, password);
  }
}
