import { useState } from "react";
import {
  LayoutDashboard, Route, CalendarCheck, Ticket, Bus, Car, Users, Building2,
  MapPin, UserCircle, BarChart3, Settings, Bell, LogOut, User, Search, Plus,
  X, ChevronRight, ChevronDown, Filter, Download, Printer, QrCode, Wrench,
  Phone, Mail, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2,
  Pencil, Archive, RotateCcw, Eye, TrendingUp, Wallet, Fuel, ShieldCheck,
  Lock, SlidersHorizontal, FileText, MoreHorizontal
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

/* ------------------------------ Design tokens ------------------------------ */
const NAVY = "#142A44";
const NAVY_DARK = "#0E2038";
const NAVY_SOFT = "#22405F";
const TEAL = "#0E7C86";
const GOLD = "#C9891C";

/* --------------------------------- Fictitious data --------------------------------- */
const cities = ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Korhogo", "Daloa", "Man", "Gagnoa"];

const revenueData = [
  { j: "Lun", ca: 1180000 }, { j: "Mar", ca: 1340000 }, { j: "Mer", ca: 990000 },
  { j: "Jeu", ca: 1520000 }, { j: "Ven", ca: 1870000 }, { j: "Sam", ca: 2210000 },
  { j: "Dim", ca: 1640000 },
];

const monthlyTrips = [
  { m: "Avr", v: 412 }, { m: "Mai", v: 448 }, { m: "Jun", v: 401 },
  { m: "Jul", v: 470 }, { m: "Aoû", v: 512 }, { m: "Sep", v: 356 },
];

const voyages = [
  { id: "VY-2031", date: "05/09/2026", heure: "06:00", depart: "Abidjan", arrivee: "Bouaké", vehicule: "CI-2201-AB", chauffeur: "Koffi N. Yao", places: 52, dispo: 8, statut: "Programmé", tarif: 5000 },
  { id: "VY-2032", date: "05/09/2026", heure: "07:30", depart: "Abidjan", arrivee: "Yamoussoukro", vehicule: "CI-1187-KL", chauffeur: "Adjoua Bamba", places: 30, dispo: 0, statut: "En cours", tarif: 3500 },
  { id: "VY-2033", date: "05/09/2026", heure: "08:00", depart: "San-Pédro", arrivee: "Abidjan", vehicule: "CI-0942-TR", chauffeur: "Issouf Traoré", places: 45, dispo: 12, statut: "Programmé", tarif: 6500 },
  { id: "VY-2034", date: "05/09/2026", heure: "09:15", depart: "Abidjan", arrivee: "Korhogo", vehicule: "CI-3310-GH", chauffeur: "Marc Ouattara", places: 52, dispo: 21, statut: "Programmé", tarif: 8000 },
  { id: "VY-2028", date: "05/09/2026", heure: "05:00", depart: "Daloa", arrivee: "Abidjan", vehicule: "CI-2789-LM", chauffeur: "Fatou Diabaté", places: 30, dispo: 0, statut: "Terminé", tarif: 4500 },
  { id: "VY-2019", date: "05/09/2026", heure: "05:30", depart: "Abidjan", arrivee: "Man", vehicule: "CI-1560-QP", chauffeur: "Seydou Coulibaly", places: 45, dispo: 4, statut: "Annulé", tarif: 7500 },
];

const reservations = [
  { id: "RES-1042", client: "Aya Kouassi", voyage: "VY-2031 Abidjan → Bouaké", date: "04/09/2026", places: 2, montant: 10000, statut: "Confirmée" },
  { id: "RES-1043", client: "Jean-Marc Kra", voyage: "VY-2032 Abidjan → Yamoussoukro", date: "04/09/2026", places: 1, montant: 3500, statut: "Terminée" },
  { id: "RES-1044", client: "Mariam Cissé", voyage: "VY-2034 Abidjan → Korhogo", date: "05/09/2026", places: 3, montant: 24000, statut: "En attente" },
  { id: "RES-1045", client: "Paul Assi", voyage: "VY-2033 San-Pédro → Abidjan", date: "05/09/2026", places: 1, montant: 6500, statut: "Confirmée" },
  { id: "RES-1046", client: "Nadège Yao", voyage: "VY-2019 Abidjan → Man", date: "03/09/2026", places: 2, montant: 15000, statut: "Annulée" },
];

const billets = [
  { id: "BIL-58231", client: "Aya Kouassi", depart: "Abidjan", destination: "Bouaké", siege: "14B", prix: 5000, date: "04/09/2026", agent: "Fatou D.", statut: "Valide" },
  { id: "BIL-58232", client: "Jean-Marc Kra", depart: "Abidjan", destination: "Yamoussoukro", siege: "07A", prix: 3500, date: "04/09/2026", agent: "Fatou D.", statut: "Utilisé" },
  { id: "BIL-58233", client: "Paul Assi", depart: "San-Pédro", destination: "Abidjan", siege: "22C", prix: 6500, date: "05/09/2026", agent: "Roger K.", statut: "Valide" },
  { id: "BIL-58234", client: "Nadège Yao", depart: "Abidjan", destination: "Man", siege: "10A", prix: 7500, date: "03/09/2026", agent: "Roger K.", statut: "Annulé" },
];

const vehicules = [
  { immat: "CI-2201-AB", marque: "Toyota", modele: "Coaster", capacite: 30, annee: 2022, gare: "Abidjan – Adjamé", chauffeur: "Koffi N. Yao", statut: "Disponible" },
  { immat: "CI-1187-KL", marque: "Hyundai", modele: "County", capacite: 30, annee: 2021, gare: "Abidjan – Adjamé", chauffeur: "Adjoua Bamba", statut: "En voyage" },
  { immat: "CI-0942-TR", marque: "Iveco", modele: "Daily Bus", capacite: 45, annee: 2023, gare: "San-Pédro", chauffeur: "Issouf Traoré", statut: "En voyage" },
  { immat: "CI-3310-GH", marque: "Toyota", modele: "Coaster", capacite: 52, annee: 2020, gare: "Abidjan – Adjamé", chauffeur: "Marc Ouattara", statut: "Disponible" },
  { immat: "CI-2789-LM", marque: "Mercedes", modele: "Sprinter", capacite: 30, annee: 2019, gare: "Daloa", chauffeur: "Fatou Diabaté", statut: "Maintenance" },
  { immat: "CI-1560-QP", marque: "Toyota", modele: "Coaster", capacite: 45, annee: 2018, gare: "Man", chauffeur: "Seydou Coulibaly", statut: "Hors service" },
];

const chauffeurs = [
  { nom: "Koffi N. Yao", tel: "+225 07 01 02 03 04", permis: "D", exp: "12/2027", vehicule: "CI-2201-AB", voyages: 184, statut: "Disponible" },
  { nom: "Adjoua Bamba", tel: "+225 05 12 34 56 78", permis: "D", exp: "06/2026", vehicule: "CI-1187-KL", voyages: 231, statut: "En voyage" },
  { nom: "Issouf Traoré", tel: "+225 01 45 67 89 10", permis: "D1", exp: "09/2028", vehicule: "CI-0942-TR", voyages: 97, statut: "En voyage" },
  { nom: "Marc Ouattara", tel: "+225 07 88 99 00 11", permis: "D", exp: "03/2027", vehicule: "CI-3310-GH", voyages: 156, statut: "Disponible" },
  { nom: "Fatou Diabaté", tel: "+225 05 22 33 44 55", permis: "D", exp: "11/2025", vehicule: "CI-2789-LM", voyages: 63, statut: "Indisponible" },
];

const employes = [
  { nom: "Diabaté", prenom: "Fatou", tel: "+225 05 22 33 44 55", fonction: "Agent de gare", gare: "Abidjan – Adjamé", statut: "Actif", cree: "03/01/2024" },
  { nom: "Konan", prenom: "Roger", tel: "+225 01 09 08 07 06", fonction: "Agent de gare", gare: "San-Pédro", statut: "Actif", cree: "17/05/2023" },
  { nom: "Traoré", prenom: "Awa", tel: "+225 07 55 44 33 22", fonction: "Responsable de gare", gare: "Bouaké", statut: "Actif", cree: "22/11/2022" },
  { nom: "N'Guessan", prenom: "Éric", tel: "+225 05 66 77 88 99", fonction: "Comptable", gare: "Abidjan – Adjamé", statut: "Archivé", cree: "09/02/2021" },
];

const gares = [
  { nom: "Abidjan – Adjamé", ville: "Abidjan", commune: "Adjamé", adresse: "Gare routière, Bd Nangui Abrogoua", resp: "Awa Traoré", employes: 18, statut: "Active" },
  { nom: "Bouaké – Centre", ville: "Bouaké", commune: "Bouaké", adresse: "Av. de la République", resp: "Ibrahim Fofana", employes: 9, statut: "Active" },
  { nom: "San-Pédro", ville: "San-Pédro", commune: "San-Pédro", adresse: "Route du Port", resp: "Roger Konan", employes: 7, statut: "Active" },
  { nom: "Daloa", ville: "Daloa", commune: "Daloa", adresse: "Quartier Commerce", resp: "Grace Kouamé", employes: 5, statut: "Inactive" },
];

const villes = [
  { code: "ABJ", nom: "Abidjan", region: "Lagunes", gares: 1, statut: "Active" },
  { code: "BKE", nom: "Bouaké", region: "Gbêkê", gares: 1, statut: "Active" },
  { code: "YAM", nom: "Yamoussoukro", region: "Bélier", gares: 1, statut: "Active" },
  { code: "SPD", nom: "San-Pédro", region: "San-Pédro", gares: 1, statut: "Active" },
  { code: "KOR", nom: "Korhogo", region: "Poro", gares: 1, statut: "Active" },
  { code: "DLA", nom: "Daloa", region: "Haut-Sassandra", gares: 1, statut: "Inactive" },
];

const clients = [
  { nom: "Aya Kouassi", tel: "+225 07 11 22 33 44", email: "aya.kouassi@mail.ci", res: 14, dernier: "01/09/2026", statut: "Actif" },
  { nom: "Jean-Marc Kra", tel: "+225 05 22 11 00 99", email: "jm.kra@mail.ci", res: 6, dernier: "28/08/2026", statut: "Actif" },
  { nom: "Mariam Cissé", tel: "+225 01 33 44 55 66", email: "mariam.cisse@mail.ci", res: 21, dernier: "05/09/2026", statut: "Actif" },
  { nom: "Paul Assi", tel: "+225 07 99 88 77 66", email: "paul.assi@mail.ci", res: 3, dernier: "12/06/2026", statut: "Inactif" },
];

const notifications = [
  { type: "alert", texte: "Le véhicule CI-2789-LM nécessite une maintenance", temps: "Il y a 12 min" },
  { type: "info", texte: "Le voyage VY-2034 (Abidjan → Korhogo) démarre dans 45 min", temps: "Il y a 30 min" },
  { type: "success", texte: "Nouvelle réservation RES-1044 créée par Mariam Cissé", temps: "Il y a 1 h" },
  { type: "alert", texte: "Le chauffeur Fatou Diabaté est indisponible aujourd'hui", temps: "Il y a 2 h" },
  { type: "danger", texte: "La réservation RES-1046 a été annulée", temps: "Hier, 18:42" },
];

const activites = [
  { texte: "Réservation RES-1044 créée", auteur: "Mariam Cissé", temps: "10:12" },
  { texte: "Billet BIL-58233 vendu", auteur: "Roger K.", temps: "09:58" },
  { texte: "Véhicule CI-3310-GH affecté au voyage VY-2034", auteur: "Système", temps: "09:40" },
  { texte: "Chauffeur Issouf Traoré affecté au voyage VY-2033", auteur: "Système", temps: "08:05" },
];

const fmt = (n) => n.toLocaleString("fr-FR") + " FCFA";

/* --------------------------------- UI atoms --------------------------------- */
function Badge({ children, tone = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[tone]}`}>{children}</span>;
}

const statutTone = {
  "Programmé": "blue", "En cours": "amber", "Terminé": "slate", "Annulé": "rose",
  "Confirmée": "emerald", "En attente": "amber", "Annulée": "rose", "Terminée": "slate",
  "Valide": "emerald", "Utilisé": "slate", "Annulé2": "rose",
  "Disponible": "emerald", "En voyage": "blue", "Maintenance": "amber", "Hors service": "rose",
  "Indisponible": "rose", "Actif": "emerald", "Archivé": "slate", "Active": "emerald", "Inactive": "slate",
  "Inactif": "slate",
};

function StatusBadge({ s }) {
  return <Badge tone={statutTone[s] || "slate"}>{s}</Badge>;
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className="rounded-xl p-2.5" style={{ backgroundColor: `${color}17` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </Card>
  );
}

function PageHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
      style={{ backgroundColor: NAVY }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = NAVY_SOFT)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
    >
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">
      {Icon && <Icon size={15} />} {children}
    </button>
  );
}

function Th({ children }) {
  return <th className="text-left text-xs font-medium text-slate-400 px-4 py-3 whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap ${className}`}>{children}</td>;
}

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-100">
          <tr>{head.map((h, i) => <Th key={i}>{h}</Th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-50">{children}</tbody>
      </table>
    </div>
  );
}

function Toolbar({ children }) {
  return <div className="flex flex-wrap items-center gap-2 mb-4">{children}</div>;
}

function SearchBox({ placeholder }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-400 w-64">
      <Search size={15} /> {placeholder}
    </div>
  );
}

function Select({ label }) {
  return (
    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600">
      {label} <ChevronDown size={14} className="text-slate-400" />
    </button>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[88vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300";

/* --------------------------------- Sidebar / Topbar --------------------------------- */
const NAV = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { key: "voyages", label: "Voyages", icon: Route },
  { key: "reservations", label: "Réservations", icon: CalendarCheck },
  { key: "billets", label: "Billets", icon: Ticket },
  { key: "vehicules", label: "Véhicules", icon: Bus },
  { key: "chauffeurs", label: "Chauffeurs", icon: Car },
  { key: "employes", label: "Employés", icon: Users },
  { key: "gares", label: "Gares", icon: Building2 },
  { key: "villes", label: "Villes", icon: MapPin },
  { key: "clients", label: "Clients", icon: UserCircle },
  { key: "rapports", label: "Rapports", icon: BarChart3 },
  { key: "parametres", label: "Paramètres", icon: Settings },
];

function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside className="w-64 shrink-0 h-full flex flex-col" style={{ backgroundColor: NAVY_DARK }}>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TEAL }}>
          <Route size={17} color="white" />
        </div>
        <div>
          <p className="text-white font-semibold leading-none">TransCI</p>
          <p className="text-slate-400 text-[11px] mt-1">Gestion de transport</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = page === key;
          return (
            <button
              key={key}
              onClick={() => setPage(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={active ? { backgroundColor: NAVY_SOFT, color: "white" } : { color: "#93A3BB" }}
            >
              <Icon size={17} />
              <span className="font-medium">{label}</span>
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5">
          <User size={17} /> Fatou Diabaté <span className="ml-auto text-[10px] text-slate-500">Admin</span>
        </button>
        <button onClick={() => setPage("notifications")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5">
          <Bell size={17} /> Notifications <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">3</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5">
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <p className="font-semibold text-slate-900">{title}</p>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-400 w-64">
          <Search size={14} /> Rechercher un voyage, client…
        </div>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
            <Bell size={16} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-40">
              {notifications.slice(0, 3).map((n, i) => (
                <div key={i} className="px-3 py-2 rounded-lg hover:bg-slate-50">
                  <p className="text-sm text-slate-700">{n.texte}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.temps}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: NAVY }}>FD</div>
      </div>
    </div>
  );
}

/* --------------------------------- Login page --------------------------------- */
function LoginPage({ onLogin }) {
  return (
    <div className="min-h-full w-full flex" style={{ backgroundColor: "#F5F6F8" }}>
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: TEAL }}>
            <Route size={17} color="white" />
          </div>
          <p className="font-semibold">TransCI</p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight max-w-sm">La gestion de votre réseau interurbain, sur une seule plateforme.</h2>
          <p className="text-slate-300 mt-4 max-w-sm text-sm">Voyages, réservations, billets, véhicules et chauffeurs, centralisés pour vos gares à travers la Côte d'Ivoire.</p>
        </div>
        <svg viewBox="0 0 400 60" className="w-full opacity-40">
          <line x1="0" y1="30" x2="400" y2="30" stroke="white" strokeWidth="2" strokeDasharray="10 8" />
          {[20, 140, 260, 380].map((x, i) => <circle key={i} cx={x} cy="30" r="6" fill={TEAL} />)}
        </svg>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Connexion</h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">Accédez à votre espace d'administration.</p>
          <Field label="Identifiant"><input className={inputCls} placeholder="fatou.diabate" /></Field>
          <Field label="Mot de passe"><input type="password" className={inputCls} placeholder="••••••••" /></Field>
          <div className="flex items-center justify-between mb-6 text-sm">
            <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" /> Se souvenir de moi</label>
            <button className="font-medium" style={{ color: TEAL }}>Mot de passe oublié ?</button>
          </div>
          <button onClick={onLogin} className="w-full py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: NAVY }}>
            Se connecter
          </button>
          <p className="text-xs text-slate-400 mt-6 text-center">TransCI — Plateforme de gestion de transport interurbain</p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Dashboard --------------------------------- */
function Dashboard() {
  return (
    <div>
      <PageHeader title="Tableau de bord" sub="Vendredi 5 septembre 2026 — Vue d'ensemble de l'activité" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon={Route} label="Voyages aujourd'hui" value="18" sub="4 en cours" color={TEAL} />
        <StatCard icon={CalendarCheck} label="Réservations" value="63" sub="+12% vs hier" color="#2563EB" />
        <StatCard icon={Ticket} label="Billets vendus" value="212" sub="Aujourd'hui" color={GOLD} />
        <StatCard icon={Wallet} label="Chiffre d'affaires" value="1,64M" sub="FCFA aujourd'hui" color="#1E8A5A" />
        <StatCard icon={Bus} label="Véhicules dispo." value="9 / 14" sub="2 en maintenance" color="#7C3AED" />
        <StatCard icon={Car} label="Chauffeurs dispo." value="11 / 15" sub="1 indisponible" color="#C4453D" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-900">Évolution du chiffre d'affaires</p>
              <p className="text-xs text-slate-400">7 derniers jours</p>
            </div>
            <div className="flex gap-2">
              <Select label="7 jours" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TEAL} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="j" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Area type="monotone" dataKey="ca" stroke={TEAL} strokeWidth={2} fill="url(#ca)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-slate-900 mb-4">Activités récentes</p>
          <div className="space-y-4">
            {activites.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: TEAL }} />
                <div>
                  <p className="text-sm text-slate-700">{a.texte}</p>
                  <p className="text-xs text-slate-400">{a.auteur} · {a.temps}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="font-semibold text-slate-900">Voyages du jour</p>
          <GhostButton icon={Filter}>Filtrer</GhostButton>
        </div>
        <div className="p-1">
          <Table head={["Heure", "Départ", "Destination", "Véhicule", "Chauffeur", "Places", "Statut"]}>
            {voyages.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <Td>{v.heure}</Td>
                <Td>{v.depart}</Td>
                <Td>{v.arrivee}</Td>
                <Td>{v.vehicule}</Td>
                <Td>{v.chauffeur}</Td>
                <Td>{v.dispo} / {v.places}</Td>
                <Td><StatusBadge s={v.statut} /></Td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------- Voyages --------------------------------- */
function VoyagesPage() {
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState(null);
  return (
    <div>
      <PageHeader title="Voyages" sub="Planification et suivi des départs" action={<PrimaryButton icon={Plus} onClick={() => setShowNew(true)}>Nouveau voyage</PrimaryButton>} />
      <Toolbar><SearchBox placeholder="Rechercher un voyage…" /><Select label="Statut" /><Select label="Gare" /><Select label="Date" /></Toolbar>
      <Card>
        <Table head={["N° voyage", "Date", "Heure", "Départ", "Destination", "Véhicule", "Chauffeur", "Places", "Statut", ""]}>
          {voyages.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetail(v)}>
              <Td className="font-medium text-slate-900">{v.id}</Td>
              <Td>{v.date}</Td>
              <Td>{v.heure}</Td>
              <Td>{v.depart}</Td>
              <Td>{v.arrivee}</Td>
              <Td>{v.vehicule}</Td>
              <Td>{v.chauffeur}</Td>
              <Td>{v.dispo} / {v.places}</Td>
              <Td><StatusBadge s={v.statut} /></Td>
              <Td><Eye size={16} className="text-slate-400" /></Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouveau voyage" wide>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Ville / gare de départ">
            <select className={inputCls}>{cities.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Ville / gare d'arrivée">
            <select className={inputCls}>{cities.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Date"><input type="date" className={inputCls} /></Field>
          <Field label="Heure"><input type="time" className={inputCls} /></Field>
          <Field label="Véhicule"><select className={inputCls}>{vehicules.map((v) => <option key={v.immat}>{v.immat} — {v.modele}</option>)}</select></Field>
          <Field label="Chauffeur"><select className={inputCls}>{chauffeurs.map((c) => <option key={c.nom}>{c.nom}</option>)}</select></Field>
          <Field label="Nombre de places"><input type="number" className={inputCls} placeholder="52" /></Field>
          <Field label="Tarif (FCFA)"><input type="number" className={inputCls} placeholder="5000" /></Field>
        </div>
        <Field label="Observations"><textarea className={inputCls} rows={3} placeholder="Informations complémentaires…" /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={() => setShowNew(false)}>Annuler</GhostButton>
          <PrimaryButton onClick={() => setShowNew(false)}>Enregistrer le voyage</PrimaryButton>
        </div>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Voyage ${detail.id}` : ""} wide>
        {detail && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-slate-900">
                <span className="font-semibold">{detail.depart}</span>
                <Route size={16} className="text-slate-400" />
                <span className="font-semibold">{detail.arrivee}</span>
              </div>
              <StatusBadge s={detail.statut} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-6">
              <div><p className="text-slate-400">Date</p><p className="text-slate-800 font-medium">{detail.date}</p></div>
              <div><p className="text-slate-400">Heure</p><p className="text-slate-800 font-medium">{detail.heure}</p></div>
              <div><p className="text-slate-400">Tarif</p><p className="text-slate-800 font-medium">{fmt(detail.tarif)}</p></div>
              <div><p className="text-slate-400">Véhicule</p><p className="text-slate-800 font-medium">{detail.vehicule}</p></div>
              <div><p className="text-slate-400">Chauffeur</p><p className="text-slate-800 font-medium">{detail.chauffeur}</p></div>
              <div><p className="text-slate-400">Places</p><p className="text-slate-800 font-medium">{detail.dispo} disponibles / {detail.places}</p></div>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-2">Réservations sur ce voyage</p>
            <Card>
              <Table head={["Client", "Places", "Statut"]}>
                {reservations.filter((r) => r.voyage.startsWith(detail.id)).map((r) => (
                  <tr key={r.id}><Td>{r.client}</Td><Td>{r.places}</Td><Td><StatusBadge s={r.statut} /></Td></tr>
                ))}
              </Table>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --------------------------------- Réservations --------------------------------- */
function ReservationsPage() {
  const [detail, setDetail] = useState(null);
  return (
    <div>
      <PageHeader title="Réservations" sub="Suivi des réservations clients" />
      <Toolbar><SearchBox placeholder="Rechercher une réservation…" /><Select label="Date" /><Select label="Voyage" /><Select label="Gare" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["N° réservation", "Client", "Voyage", "Date", "Places", "Montant", "Statut", ""]}>
          {reservations.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetail(r)}>
              <Td className="font-medium text-slate-900">{r.id}</Td>
              <Td>{r.client}</Td>
              <Td>{r.voyage}</Td>
              <Td>{r.date}</Td>
              <Td>{r.places}</Td>
              <Td>{fmt(r.montant)}</Td>
              <Td><StatusBadge s={r.statut} /></Td>
              <Td><Eye size={16} className="text-slate-400" /></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Réservation ${detail.id}` : ""}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Client</span><span className="font-medium text-slate-800">{detail.client}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Voyage</span><span className="font-medium text-slate-800">{detail.voyage}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-medium text-slate-800">{detail.date}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Places</span><span className="font-medium text-slate-800">{detail.places}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Montant</span><span className="font-medium text-slate-800">{fmt(detail.montant)}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-400">Statut</span><StatusBadge s={detail.statut} /></div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <GhostButton>Annuler la réservation</GhostButton>
              <PrimaryButton>Confirmer</PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --------------------------------- Billets --------------------------------- */
function TicketPreview({ b }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200">
      <div className="p-5 text-white" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Route size={16} /> <span className="font-semibold">TransCI</span></div>
          <span className="text-xs opacity-70">{b.id}</span>
        </div>
      </div>
      <div className="p-5 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400">Départ</p>
            <p className="font-semibold text-slate-900">{b.depart}</p>
          </div>
          <Route size={16} className="text-slate-300" />
          <div className="text-right">
            <p className="text-xs text-slate-400">Destination</p>
            <p className="font-semibold text-slate-900">{b.destination}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm border-t border-dashed border-slate-200 pt-4">
          <div><p className="text-xs text-slate-400">Passager</p><p className="text-slate-800">{b.client}</p></div>
          <div><p className="text-xs text-slate-400">Date</p><p className="text-slate-800">{b.date}</p></div>
          <div><p className="text-xs text-slate-400">Siège</p><p className="text-slate-800">{b.siege}</p></div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-slate-200">
          <div>
            <p className="text-xs text-slate-400">Prix</p>
            <p className="font-semibold text-slate-900">{fmt(b.prix)}</p>
          </div>
          <div className="w-16 h-16 rounded-lg bg-slate-900 flex items-center justify-center">
            <QrCode size={40} color="white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BilletsPage() {
  const [preview, setPreview] = useState(null);
  return (
    <div>
      <PageHeader title="Billets" sub="Suivi des billets vendus" />
      <Toolbar><SearchBox placeholder="Rechercher un billet…" /><Select label="Voyage" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["N° billet", "Client", "Départ", "Destination", "Siège", "Prix", "Date d'achat", "Agent", "Statut", ""]}>
          {billets.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{b.id}</Td>
              <Td>{b.client}</Td>
              <Td>{b.depart}</Td>
              <Td>{b.destination}</Td>
              <Td>{b.siege}</Td>
              <Td>{fmt(b.prix)}</Td>
              <Td>{b.date}</Td>
              <Td>{b.agent}</Td>
              <Td><StatusBadge s={b.statut} /></Td>
              <Td><button onClick={() => setPreview(b)} className="text-slate-400 hover:text-slate-700"><Eye size={16} /></button></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Aperçu du billet">
        {preview && (
          <div>
            <TicketPreview b={preview} />
            <div className="flex justify-end gap-2 pt-4">
              <GhostButton icon={Printer}>Imprimer</GhostButton>
              <PrimaryButton icon={Download}>Télécharger</PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --------------------------------- Véhicules --------------------------------- */
function VehiculesPage() {
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState("infos");
  return (
    <div>
      <PageHeader title="Véhicules" sub="Parc automobile de la compagnie" action={<PrimaryButton icon={Plus}>Nouveau véhicule</PrimaryButton>} />
      <Toolbar><SearchBox placeholder="Rechercher une immatriculation…" /><Select label="Statut" /><Select label="Gare" /></Toolbar>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicules.map((v) => (
          <Card key={v.immat} className="p-5 cursor-pointer hover:shadow-sm" onClick={() => { setDetail(v); setTab("infos"); }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${TEAL}17` }}>
                <Bus size={18} style={{ color: TEAL }} />
              </div>
              <StatusBadge s={v.statut} />
            </div>
            <p className="font-semibold text-slate-900">{v.immat}</p>
            <p className="text-sm text-slate-500">{v.marque} {v.modele} · {v.capacite} places</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <span>{v.gare}</span><span>{v.chauffeur}</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? detail.immat : ""} wide>
        {detail && (
          <div>
            <div className="flex gap-2 mb-5 border-b border-slate-100">
              {[["infos", "Informations"], ["voyages", "Historique voyages"], ["maintenance", "Maintenances"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className="px-3 py-2 text-sm font-medium border-b-2" style={tab === k ? { borderColor: TEAL, color: NAVY } : { borderColor: "transparent", color: "#94A3B8" }}>{l}</button>
              ))}
            </div>
            {tab === "infos" && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Marque / Modèle</p><p className="font-medium text-slate-800">{detail.marque} {detail.modele}</p></div>
                <div><p className="text-slate-400">Année</p><p className="font-medium text-slate-800">{detail.annee}</p></div>
                <div><p className="text-slate-400">Capacité</p><p className="font-medium text-slate-800">{detail.capacite} places</p></div>
                <div><p className="text-slate-400">Gare affectée</p><p className="font-medium text-slate-800">{detail.gare}</p></div>
                <div><p className="text-slate-400">Chauffeur affecté</p><p className="font-medium text-slate-800">{detail.chauffeur}</p></div>
                <div className="flex items-center gap-2"><p className="text-slate-400">État</p><StatusBadge s={detail.statut} /></div>
              </div>
            )}
            {tab === "voyages" && (
              <Table head={["Voyage", "Date", "Chauffeur", "Statut"]}>
                {voyages.filter((v) => v.vehicule === detail.immat).map((v) => (
                  <tr key={v.id}><Td>{v.depart} → {v.arrivee}</Td><Td>{v.date}</Td><Td>{v.chauffeur}</Td><Td><StatusBadge s={v.statut} /></Td></tr>
                ))}
              </Table>
            )}
            {tab === "maintenance" && (
              <div className="space-y-3">
                {[{ d: "12/07/2026", t: "Vidange + freins", cout: 85000 }, { d: "02/03/2026", t: "Révision générale", cout: 210000 }].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3"><Wrench size={16} className="text-slate-400" /><div><p className="text-sm text-slate-800">{m.t}</p><p className="text-xs text-slate-400">{m.d}</p></div></div>
                    <p className="text-sm font-medium text-slate-700">{fmt(m.cout)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --------------------------------- Chauffeurs --------------------------------- */
function ChauffeursPage() {
  const [detail, setDetail] = useState(null);
  return (
    <div>
      <PageHeader title="Chauffeurs" sub="Personnel de conduite" action={<PrimaryButton icon={Plus}>Nouveau chauffeur</PrimaryButton>} />
      <Toolbar><SearchBox placeholder="Rechercher un chauffeur…" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["", "Nom complet", "Téléphone", "Permis", "Expiration", "Véhicule", "Voyages", "Statut"]}>
          {chauffeurs.map((c) => (
            <tr key={c.nom} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetail(c)}>
              <Td><div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: NAVY }}>{c.nom.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div></Td>
              <Td className="font-medium text-slate-900">{c.nom}</Td>
              <Td>{c.tel}</Td>
              <Td>{c.permis}</Td>
              <Td>{c.exp}</Td>
              <Td>{c.vehicule}</Td>
              <Td>{c.voyages}</Td>
              <Td><StatusBadge s={c.statut} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? detail.nom : ""}>
        {detail && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg" style={{ backgroundColor: NAVY }}>{detail.nom.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div><p className="font-semibold text-slate-900">{detail.nom}</p><StatusBadge s={detail.statut} /></div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {detail.tel}</div>
              <div className="flex items-center gap-2 text-slate-600"><ShieldCheck size={14} className="text-slate-400" /> Permis {detail.permis} — expire {detail.exp}</div>
              <div className="flex items-center gap-2 text-slate-600"><Bus size={14} className="text-slate-400" /> Véhicule affecté : {detail.vehicule}</div>
              <div className="flex items-center gap-2 text-slate-600"><Route size={14} className="text-slate-400" /> {detail.voyages} voyages effectués</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --------------------------------- Employés --------------------------------- */
function EmployesPage() {
  return (
    <div>
      <PageHeader title="Employés" sub="Personnel administratif" action={<PrimaryButton icon={Plus}>Ajouter un employé</PrimaryButton>} />
      <Toolbar><SearchBox placeholder="Rechercher un employé…" /><Select label="Fonction" /><Select label="Gare" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["Nom", "Prénom", "Téléphone", "Fonction", "Gare", "Statut", "Créé le", ""]}>
          {employes.map((e, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{e.nom}</Td>
              <Td>{e.prenom}</Td>
              <Td>{e.tel}</Td>
              <Td>{e.fonction}</Td>
              <Td>{e.gare}</Td>
              <Td><StatusBadge s={e.statut} /></Td>
              <Td>{e.cree}</Td>
              <Td>
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="hover:text-slate-700"><Pencil size={15} /></button>
                  {e.statut === "Actif" ? <button className="hover:text-slate-700"><Archive size={15} /></button> : <button className="hover:text-slate-700"><RotateCcw size={15} /></button>}
                  <button className="hover:text-slate-700"><Eye size={15} /></button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

/* --------------------------------- Gares --------------------------------- */
function GaresPage() {
  return (
    <div>
      <PageHeader title="Gares" sub="Points d'exploitation du réseau" action={<PrimaryButton icon={Plus}>Nouvelle gare</PrimaryButton>} />
      <Toolbar><SearchBox placeholder="Rechercher une gare…" /><Select label="Ville" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["Nom de la gare", "Ville", "Commune", "Adresse", "Responsable", "Employés", "Statut", ""]}>
          {gares.map((g, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{g.nom}</Td>
              <Td>{g.ville}</Td>
              <Td>{g.commune}</Td>
              <Td>{g.adresse}</Td>
              <Td>{g.resp}</Td>
              <Td>{g.employes}</Td>
              <Td><StatusBadge s={g.statut} /></Td>
              <Td><Eye size={15} className="text-slate-400" /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

/* --------------------------------- Villes --------------------------------- */
function VillesPage() {
  return (
    <div>
      <PageHeader title="Villes" sub="Villes desservies par la compagnie" action={<PrimaryButton icon={Plus}>Ajouter une ville</PrimaryButton>} />
      <Toolbar><SearchBox placeholder="Rechercher une ville…" /><Select label="Région" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["Code", "Nom", "Région", "Gares", "Statut", ""]}>
          {villes.map((v) => (
            <tr key={v.code} className="hover:bg-slate-50">
              <Td className="font-medium text-slate-900">{v.code}</Td>
              <Td>{v.nom}</Td>
              <Td>{v.region}</Td>
              <Td>{v.gares}</Td>
              <Td><StatusBadge s={v.statut} /></Td>
              <Td><Pencil size={15} className="text-slate-400" /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

/* --------------------------------- Clients --------------------------------- */
function ClientsPage() {
  const [detail, setDetail] = useState(null);
  return (
    <div>
      <PageHeader title="Clients" sub="Base clients de la compagnie" />
      <Toolbar><SearchBox placeholder="Rechercher un client…" /><Select label="Statut" /></Toolbar>
      <Card>
        <Table head={["Nom complet", "Téléphone", "Email", "Réservations", "Dernier voyage", "Statut", ""]}>
          {clients.map((c, i) => (
            <tr key={i} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetail(c)}>
              <Td className="font-medium text-slate-900">{c.nom}</Td>
              <Td>{c.tel}</Td>
              <Td>{c.email}</Td>
              <Td>{c.res}</Td>
              <Td>{c.dernier}</Td>
              <Td><StatusBadge s={c.statut} /></Td>
              <Td><Eye size={15} className="text-slate-400" /></Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? detail.nom : ""} wide>
        {detail && (
          <div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {detail.tel}</div>
              <div className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400" /> {detail.email}</div>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-2">Historique des réservations</p>
            <Card>
              <Table head={["Réservation", "Voyage", "Date", "Statut"]}>
                {reservations.filter((r) => r.client === detail.nom).map((r) => (
                  <tr key={r.id}><Td>{r.id}</Td><Td>{r.voyage}</Td><Td>{r.date}</Td><Td><StatusBadge s={r.statut} /></Td></tr>
                ))}
              </Table>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --------------------------------- Rapports --------------------------------- */
function RapportsPage() {
  const [period, setPeriod] = useState("Ce mois");
  return (
    <div>
      <PageHeader title="Rapports" sub="Analyse de l'activité de la compagnie" action={
        <div className="flex gap-2"><GhostButton icon={FileText}>Export PDF</GhostButton><GhostButton icon={Download}>Export Excel</GhostButton></div>
      } />
      <div className="flex gap-2 mb-5">
        {["Aujourd'hui", "Cette semaine", "Ce mois", "Cette année", "Période personnalisée"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className="px-3.5 py-2 rounded-lg text-sm font-medium border" style={period === p ? { backgroundColor: NAVY, color: "white", borderColor: NAVY } : { borderColor: "#E2E8F0", color: "#475569" }}>{p}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} label="Revenus" value="38,4M FCFA" color="#1E8A5A" />
        <StatCard icon={Route} label="Voyages" value="512" color={TEAL} />
        <StatCard icon={Ticket} label="Billets vendus" value="2 340" color={GOLD} />
        <StatCard icon={CalendarCheck} label="Réservations" value="1 870" color="#2563EB" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <p className="font-semibold text-slate-900 mb-4">Voyages par mois</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrips}>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <Tooltip />
              <Bar dataKey="v" fill={NAVY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <p className="font-semibold text-slate-900 mb-4">Taux de remplissage par gare</p>
          <div className="space-y-4 mt-2">
            {gares.map((g, i) => {
              const pct = [82, 64, 71, 45][i];
              return (
                <div key={g.nom}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{g.nom}</span><span className="text-slate-400">{pct}%</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: TEAL }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <Card>
        <p className="font-semibold text-slate-900 px-5 pt-5">Performance des chauffeurs</p>
        <Table head={["Chauffeur", "Voyages", "Statut"]}>
          {chauffeurs.map((c) => (
            <tr key={c.nom}><Td>{c.nom}</Td><Td>{c.voyages}</Td><Td><StatusBadge s={c.statut} /></Td></tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

/* --------------------------------- Notifications --------------------------------- */
function NotificationsPage() {
  const icon = { alert: AlertTriangle, info: Clock, success: CheckCircle2, danger: XCircle };
  const tone = { alert: "amber", info: "blue", success: "emerald", danger: "rose" };
  return (
    <div>
      <PageHeader title="Notifications" sub="Centre de notifications" />
      <Card>
        <div className="divide-y divide-slate-50">
          {notifications.map((n, i) => {
            const Icon = icon[n.type];
            return (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="rounded-lg p-2 mt-0.5" style={{ backgroundColor: n.type === "success" ? "#ECFDF5" : n.type === "danger" ? "#FEF2F2" : n.type === "alert" ? "#FFFBEB" : "#EFF6FF" }}>
                  <Icon size={16} className={`text-${tone[n.type]}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{n.texte}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.temps}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------- Paramètres --------------------------------- */
function ParametresPage() {
  const [tab, setTab] = useState("profil");
  const tabs = [["profil", "Profil", User], ["securite", "Mot de passe", Lock], ["notifs", "Notifications", Bell], ["prefs", "Préférences", SlidersHorizontal], ["roles", "Utilisateurs & rôles", ShieldCheck]];
  return (
    <div>
      <PageHeader title="Paramètres" sub="Gestion du compte et de la plateforme" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Card className="p-2 h-fit">
          {tabs.map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left" style={tab === k ? { backgroundColor: `${TEAL}12`, color: NAVY, fontWeight: 500 } : { color: "#64748B" }}>
              <Icon size={16} /> {l}
            </button>
          ))}
        </Card>
        <Card className="p-6 lg:col-span-3">
          {tab === "profil" && (
            <div className="max-w-md">
              <p className="font-semibold text-slate-900 mb-4">Informations personnelles</p>
              <Field label="Nom complet"><input className={inputCls} defaultValue="Fatou Diabaté" /></Field>
              <Field label="Téléphone"><input className={inputCls} defaultValue="+225 05 22 33 44 55" /></Field>
              <Field label="Email"><input className={inputCls} defaultValue="fatou.diabate@transci.ci" /></Field>
              <PrimaryButton>Enregistrer les modifications</PrimaryButton>
            </div>
          )}
          {tab === "securite" && (
            <div className="max-w-md">
              <p className="font-semibold text-slate-900 mb-4">Mot de passe</p>
              <Field label="Mot de passe actuel"><input type="password" className={inputCls} /></Field>
              <Field label="Nouveau mot de passe"><input type="password" className={inputCls} /></Field>
              <Field label="Confirmer le mot de passe"><input type="password" className={inputCls} /></Field>
              <PrimaryButton>Mettre à jour</PrimaryButton>
            </div>
          )}
          {tab === "notifs" && (
            <div className="max-w-md space-y-4">
              <p className="font-semibold text-slate-900 mb-2">Préférences de notification</p>
              {["Nouvelle réservation", "Véhicule nécessitant une maintenance", "Voyage annulé", "Chauffeur indisponible"].map((n) => (
                <label key={n} className="flex items-center justify-between text-sm text-slate-600">
                  {n} <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          )}
          {tab === "prefs" && (
            <div className="max-w-md">
              <p className="font-semibold text-slate-900 mb-4">Préférences générales</p>
              <Field label="Langue"><select className={inputCls}><option>Français</option><option>English</option></select></Field>
              <Field label="Fuseau horaire"><select className={inputCls}><option>GMT (Abidjan)</option></select></Field>
            </div>
          )}
          {tab === "roles" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-slate-900">Rôles et permissions</p>
                <PrimaryButton icon={Plus}>Nouvel utilisateur</PrimaryButton>
              </div>
              <Table head={["Module", "Administrateur", "Responsable de gare", "Agent de gare", "Chauffeur"]}>
                {["Voyages", "Réservations", "Billets", "Véhicules", "Rapports"].map((m) => (
                  <tr key={m}>
                    <Td className="font-medium text-slate-900">{m}</Td>
                    <Td><CheckCircle2 size={16} className="text-emerald-600" /></Td>
                    <Td><CheckCircle2 size={16} className="text-emerald-600" /></Td>
                    <Td>{["Voyages", "Réservations", "Billets"].includes(m) ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-slate-300" />}</Td>
                    <Td><XCircle size={16} className="text-slate-300" /></Td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* --------------------------------- App shell --------------------------------- */
const TITLES = {
  dashboard: "Tableau de bord", voyages: "Voyages", reservations: "Réservations", billets: "Billets",
  vehicules: "Véhicules", chauffeurs: "Chauffeurs", employes: "Employés", gares: "Gares",
  villes: "Villes", clients: "Clients", rapports: "Rapports", notifications: "Notifications", parametres: "Paramètres",
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  const pages = {
    dashboard: <Dashboard />, voyages: <VoyagesPage />, reservations: <ReservationsPage />,
    billets: <BilletsPage />, vehicules: <VehiculesPage />, chauffeurs: <ChauffeursPage />,
    employes: <EmployesPage />, gares: <GaresPage />, villes: <VillesPage />, clients: <ClientsPage />,
    rapports: <RapportsPage />, notifications: <NotificationsPage />, parametres: <ParametresPage />,
  };

  return (
    <div className="h-[860px] w-full flex bg-slate-50 font-sans overflow-hidden rounded-xl border border-slate-200">
      <Sidebar page={page} setPage={setPage} onLogout={() => setLoggedIn(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={TITLES[page]} />
        <div className="flex-1 overflow-y-auto p-6">{pages[page]}</div>
      </div>
    </div>
  );
}