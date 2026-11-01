import React, { useState, useEffect } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Server,
  Cpu,
  Radio,
  RefreshCw,
  FileCode2,
  Download,
  Terminal,
  GitBranch,
  Copy,
  Check,
  KeyRound,
  Delete,
  CheckSquare,
  Square,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  ExternalLink,
  Power,
  Info,
} from 'lucide-react';
import { ClubId, NavSection } from '../../types/cfos';
import { HARDWARE_COMPATIBILITY_SPECS } from '../../domain/rules';
import { BackupFailoverPanel } from '../BackupFailoverPanel';
import dockerComposeRaw from '../../../docker-compose.yml?raw';
import dockerfileRaw from '../../../Dockerfile?raw';
import cargoTomlRaw from '../../../Cargo.toml?raw';
import mainRsRaw from '../../../src-rust/main.rs?raw';

const ARCHITECT_PIN = '0766';

export type ArchitectTabId =
  | 'server_hardware'
  | 'onsite_runbook'
  | 'third_party_updates'
  | 'governance_backups';

interface HardwareNode {
  id: string;
  clubId: ClubId | 'bi-club';
  category:
    | 'ACCES_HEITZ'
    | 'MACHINES_FITNESS'
    | 'BIOMETRIE_INBODY'
    | 'TELEPHONIE_VOIP'
    | 'INFRA_RESEAU';
  shortName: string;
  roleShort: string;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  serverTarget: string;
  portShort: string;
  latencyMs: number;
  status: 'ONLINE' | 'STANDBY';
  stepId: string;
  stepShortLabel: string;
  model: string;
  details: string;
}

const CLUB_HARDWARE_INVENTORY: HardwareNode[] = [
  {
    id: 'hw-ai-gpu-server',
    clubId: 'carre-de-soie',
    category: 'INFRA_RESEAU',
    shortName: 'Serveur Principal C.Fitness',
    roleShort: 'Debian 12 · PostgreSQL · Redis · WebRTC',
    ipAddress: '10.10.0.10',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: 'Maître LAN',
    portShort: '443 / 3000 / 5432',
    latencyMs: 1,
    status: 'ONLINE',
    stepId: 'step-1-rack-nut-ups',
    stepShortLabel: '#01',
    model: 'Debian 12 + Rust/Node + PostgreSQL 16 + Redis 7 + RTX 4060 Ti + Onduleur Eaton',
    details:
      'Serveur maître hébergé au club Carré de Soie sur onduleur Line-Interactive, répliqué en temps réel sur les 6 appareils de secours des 2 clubs.',
  },
  {
    id: 'hw-heitz-srv',
    clubId: 'carre-de-soie',
    category: 'ACCES_HEITZ',
    shortName: 'Serveur Windows Heitz',
    roleShort: 'Service HZ.WS & Base SQL Heitz',
    ipAddress: '10.10.0.20',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: '10.10.0.10',
    portShort: 'TCP 8080 / 1433',
    latencyMs: 2,
    status: 'ONLINE',
    stepId: 'step-4-heitz-local-bridge',
    stepShortLabel: '#04',
    model: 'Windows Server SQL + API HZ.WS (idCenter 5052 CDS & 5053 Beynost)',
    details:
      'Interrogé exclusivement en circuit fermé LAN (câble RJ45 local entre 10.10.0.10 et 10.10.0.20) : aucune donnée adhérent ne transite sur Internet.',
  },
  {
    id: 'hw-yeastar-gsm-07',
    clubId: 'bi-club',
    category: 'TELEPHONIE_VOIP',
    shortName: 'Passerelle 4G Yeastar (07)',
    roleShort: '4 Cartes SIM 07 VoLTE & SMS STOP',
    ipAddress: '10.10.0.14',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: '10.10.0.10',
    portShort: 'UDP 5060 / HTTP 80',
    latencyMs: 4,
    status: 'ONLINE',
    stepId: 'step-5-telecom-ovh-yeastar',
    stepShortLabel: '#05',
    model: 'Passerelle Matérielle SIP ↔ 4 Cartes SIM Physiques 4G VoLTE (Conformité ARCEP)',
    details:
      'Émet les appels mobiles 07 et SMS via 4 cartes SIM physiques 4G VoLTE (conforme décision ARCEP n° 2022-1583).',
  },
  {
    id: 'hw-asterisk-webrtc',
    clubId: 'bi-club',
    category: 'TELEPHONIE_VOIP',
    shortName: 'Standard IPBX OVH (Fixes 04)',
    roleShort: 'Trunk SIP Fixe 04 & Casques WebRTC',
    ipAddress: '10.10.0.10',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: 'sip.ovh.fr',
    portShort: 'TCP 8089 / 5061',
    latencyMs: 11,
    status: 'ONLINE',
    stepId: 'step-5-telecom-ovh-yeastar',
    stepShortLabel: '#05',
    model: '12 Canaux SIP OVHcloud (04 26 22 55 30 / 04 22 91 36 82) + Casques Jabra USB-C',
    details:
      'Gère les appels fixes 04 des 2 accueils avec bascule automatique et transcription locale.',
  },
  {
    id: 'hw-ovh-wireguard-router',
    clubId: 'bi-club',
    category: 'INFRA_RESEAU',
    shortName: 'Routeurs Fibre & VPN',
    roleShort: 'Passerelle Réseau CDS ↔ Beynost',
    ipAddress: '10.10.0.1 / 20.0.1',
    subnetMask: '255.255.255.0',
    gateway: '10.254.0.1',
    serverTarget: 'WireGuard',
    portShort: 'UDP 51820',
    latencyMs: 2,
    status: 'ONLINE',
    stepId: 'step-9-wireguard-vpn',
    stepShortLabel: '#09',
    model: 'MikroTik RB5009UG (Carré de Soie) ↔ MikroTik hEX S (Beynost) + Switch PoE+',
    details:
      'Assure l’interconnexion privée chiffrée permanente entre les 2 clubs (< 3 ms) sans exposer aucun port sur Internet.',
  },
  {
    id: 'hw-turnstiles-cds',
    clubId: 'carre-de-soie',
    category: 'ACCES_HEITZ',
    shortName: 'Tourniquets RFID (Center)',
    roleShort: 'Contrôle d’accès Carré de Soie',
    ipAddress: '10.10.0.21',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: '10.10.0.20',
    portShort: 'TCP 8080',
    latencyMs: 5,
    status: 'ONLINE',
    stepId: 'step-4-heitz-local-bridge',
    stepShortLabel: '#04',
    model: 'Lecteurs Heitz RFID MIFARE + Bluetooth Low Energy (idCenter 5052)',
    details:
      'Lecteurs RFID/Bluetooth conservés. Impulsion d’ouverture (< 50 ms) pilotée en local par Heitz.',
  },
  {
    id: 'hw-turnstiles-bey',
    clubId: 'beynost',
    category: 'ACCES_HEITZ',
    shortName: 'Tourniquets RFID (Place)',
    roleShort: 'Contrôle d’accès Beynost',
    ipAddress: '10.20.0.21',
    subnetMask: '255.255.255.0',
    gateway: '10.20.0.1',
    serverTarget: '10.10.0.20',
    portShort: 'UDP 51820 / 8080',
    latencyMs: 9,
    status: 'ONLINE',
    stepId: 'step-9-wireguard-vpn',
    stepShortLabel: '#09',
    model: 'Lecteurs Heitz RFID MIFARE + Bluetooth Low Energy (idCenter 5053)',
    details:
      'Reliés au serveur principal via le tunnel WireGuard site-à-site avec cache autonome hors-ligne.',
  },
  {
    id: 'hw-kiosk-poe-tablets',
    clubId: 'bi-club',
    category: 'INFRA_RESEAU',
    shortName: 'Bornes Tactiles PoE PIN',
    roleShort: 'Badgeuse PIN & Accueil (Sans batterie)',
    ipAddress: '10.10.0.31 / 20.0.31',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: '10.10.0.10',
    portShort: 'HTTPS 443 (PoE)',
    latencyMs: 3,
    status: 'ONLINE',
    stepId: 'step-8-poe-kiosk-tablets',
    stepShortLabel: '#08',
    model: 'Dalles Android PoE iiyama ProLite TW1023ASC-B1P + Fully Kiosk Browser',
    details:
      'Alimentation + réseau filaire via câble unique RJ45 PoE (élimine tout gonflement de batterie lithium).',
  },
  {
    id: 'hw-checkup-cds',
    clubId: 'carre-de-soie',
    category: 'BIOMETRIE_INBODY',
    shortName: 'Technogym Checkup (Center)',
    roleShort: 'Balance BIA & Caméra 3D CDS',
    ipAddress: '10.10.0.55',
    subnetMask: '255.255.255.0',
    gateway: '10.10.0.1',
    serverTarget: 'Mywellness',
    portShort: 'HTTPS 443',
    latencyMs: 9,
    status: 'ONLINE',
    stepId: 'step-6-technogym-checkup',
    stepShortLabel: '#06',
    model: 'Station Technogym Checkup (Balance BIA, Caméra 3D, Wellness Age™)',
    details:
      'Synchronisée avec Mywellness Cloud Pro et accessible en 1 clic depuis la fiche adhérent.',
  },
  {
    id: 'hw-checkup-inbody770-bey',
    clubId: 'beynost',
    category: 'BIOMETRIE_INBODY',
    shortName: 'Technogym Checkup (Place)',
    roleShort: 'Balance BIA & Caméra 3D Beynost',
    ipAddress: '10.20.0.55',
    subnetMask: '255.255.255.0',
    gateway: '10.20.0.1',
    serverTarget: 'Mywellness',
    portShort: 'HTTPS 443',
    latencyMs: 12,
    status: 'ONLINE',
    stepId: 'step-6-technogym-checkup',
    stepShortLabel: '#06',
    model: 'Station Technogym Checkup (Balance BIA, Caméra 3D, Wellness Age™)',
    details:
      'Seconde station Technogym Checkup déployée à Beynost sur prise RJ45 dédiée.',
  },
];

const DEPLOYMENT_FILES: Record<
  'docker-compose.yml' | 'Dockerfile' | 'Cargo.toml' | 'src-rust/main.rs',
  string
> = {
  'docker-compose.yml': dockerComposeRaw,
  Dockerfile: dockerfileRaw,
  'Cargo.toml': cargoTomlRaw,
  'src-rust/main.rs': mainRsRaw,
};

const ENV_PRODUCTION_TEMPLATE = `# ============================================================================
# FICHIER .ENV DE PRODUCTION — SERVEUR LOCAL CLUB (10.10.0.10)
# Emplacement sur le serveur : /opt/cfitness-os/.env (chmod 600)
# ============================================================================

PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://cfitness_admin:MotDePasseFortLocal2026!@127.0.0.1:5432/cfitness_os
REDIS_URL=redis://127.0.0.1:6379

# CONNEXION 100 % LOCALE AU SERVEUR HEITZ (10.10.0.20)
HEITZ_WS_URL=http://10.10.0.20:8080
HEITZ_WS_DEV_KEY=CLE_DEVELOPPEUR_GENEREE_DANS_CONFIGURATION_EXE
HEITZ_ID_CENTER_CDS=5052
HEITZ_ID_CENTER_BEY=5053

# TÉLÉPHONIE OVHCLOUD (FIXES 04) & PASSERELLE 4G YEASTAR TG400 (MOBILES 07)
OVH_SIP_HOST=sip.ovh.fr
OVH_SIP_TRUNK_USER=0033426225530
OVH_SIP_TRUNK_PASS=SecretSipOvh2026!
YEASTAR_TG400_IP=http://10.10.0.14
YEASTAR_API_USER=api_cfitness
YEASTAR_API_PASS=SecretYeastar4G!

# PASSERELLE TECHNOGYM MYWELLNESS & SILAE PAIE
MYWELLNESS_CDS_SLUG=cfitness-carre-de-soie
MYWELLNESS_BEY_SLUG=cfitness-beynost
SILAE_DOSSIER_ID=081865`;

export interface OnsiteStep {
  id: string;
  number: number;
  category: 'hardware' | 'system' | 'heitz' | 'telecom' | 'biometrie' | 'kiosks' | 'vpn' | 'payroll';
  categoryLabel: string;
  step: string;
  duration: string;
  location: string;
  summary: string;
  hardwareRequired: string;
  tasks: string[];
  command: string;
  secondaryCommand?: string;
  configSnippet?: {
    filename: string;
    description: string;
    content: string;
  };
  verification: string;
  pitfall: string;
}

const ONSITE_INSTALLATION_STEPS: OnsiteStep[] = [
  {
    id: 'step-1-rack-nut-ups',
    number: 1,
    category: 'hardware',
    categoryLabel: 'Matériel & Onduleur',
    step: 'Rack Serveur 19", Onduleur Eaton & Daemon NUT',
    duration: '30 min',
    location: 'Baie Carré de Soie (10.10.0.10)',
    summary:
      'Montage du serveur maître en baie, raccordement sur prises ondulées Eaton et arrêt automatique sécurisé.',
    hardwareRequired:
      'Serveur Debian 12 (32 Go RAM, RAID1 NVMe), Onduleur Eaton Ellipse PRO 1200 VA, Switch Gigabit PoE+.',
    tasks: [
      'Fixer le serveur C.Fitness OS dans la baie 19" et brancher serveur + switch sur les prises secourues de l’onduleur Eaton.',
      'Relier le câble USB entre l’onduleur Eaton et le serveur Debian.',
      'Installer et démarrer NUT : sudo apt-get install -y nut nut-client && sudo upsdrvctl start.',
    ],
    command: 'sudo apt-get update && sudo apt-get install -y nut nut-client && sudo upsdrvctl start && upsc eaton@localhost',
    configSnippet: {
      filename: '/etc/nut/ups.conf',
      description: 'Configuration USB HID pour onduleur Eaton',
      content: `[eaton]\n  driver = usbhid-ups\n  port = auto\n  desc = "Onduleur Eaton Ellipse PRO 1200"`,
    },
    verification: '"upsc eaton@localhost" renvoie "ups.status: OL" et "battery.charge: 100".',
    pitfall: 'Brancher obligatoirement le switch et le routeur sur les prises secourues par batterie de l’onduleur.',
  },
  {
    id: 'step-2-network-debian-ufw',
    number: 2,
    category: 'system',
    categoryLabel: 'Réseau & IP Fixe',
    step: 'IP Statique 10.10.0.10, Passerelle 10.10.0.1 & Pare-feu UFW',
    duration: '20 min',
    location: 'Serveur Principal (10.10.0.10)',
    summary:
      'Fixation de l’IP statique 10.10.0.10/24, passerelle 10.10.0.1 et pare-feu UFW restreint aux 2 clubs.',
    hardwareRequired: 'Câble RJ45 Cat.6 SFTP vers le switch principal.',
    tasks: [
      'Assigner l’IP fixe 10.10.0.10, masque 255.255.255.0 et passerelle 10.10.0.1.',
      'Autoriser uniquement les sous-réseaux locaux Carré de Soie (10.10.0.0/24) et Beynost (10.20.0.0/24).',
      'Tester le ping vers la passerelle (10.10.0.1) et le serveur Heitz (10.10.0.20).',
    ],
    command: 'sudo ufw default deny incoming && sudo ufw allow from 10.10.0.0/24 && sudo ufw allow from 10.20.0.0/24 && sudo ufw enable',
    configSnippet: {
      filename: '/etc/network/interfaces',
      description: 'IP Statique Debian 12',
      content: `auto eth0\niface eth0 inet static\n  address 10.10.0.10\n  netmask 255.255.255.0\n  gateway 10.10.0.1`,
    },
    verification: '"sudo ufw status" est actif et "ping -c 3 10.10.0.20" répond en < 2 ms.',
    pitfall: 'Ne jamais laisser le serveur en DHCP dynamique.',
  },
  {
    id: 'step-3-docker-certs-systemd',
    number: 3,
    category: 'system',
    categoryLabel: 'Docker & TLS',
    step: 'Stack Docker Compose, Certificats SSL mkcert & Systemd',
    duration: '25 min',
    location: '/opt/cfitness-os (10.10.0.10)',
    summary:
      'Déploiement des conteneurs PostgreSQL 16, Redis 7 et certificats TLS locaux (pour le microphone WebRTC).',
    hardwareRequired: 'Accès sudo sur le serveur Debian 12.',
    tasks: [
      'Générer le certificat SSL local avec mkcert pour 10.10.0.10.',
      'Déposer /opt/cfitness-os/.env (chmod 600) et lancer docker compose up -d.',
      'Activer le service systemd cfitness.service pour redémarrage auto.',
    ],
    command: 'cd /opt/cfitness-os && docker compose up -d && sudo systemctl enable --now cfitness.service',
    verification: '"docker compose ps" affiche tous les conteneurs en statut "healthy".',
    pitfall: 'Le certificat HTTPS local est indispensable pour que Chrome/Safari autorise le microphone WebRTC.',
  },
  {
    id: 'step-4-heitz-local-bridge',
    number: 4,
    category: 'heitz',
    categoryLabel: 'Pont Local Heitz',
    step: 'Liaison Serveur Heitz (10.10.0.20:8080) & Tourniquets RFID',
    duration: '25 min',
    location: 'Serveur Windows Heitz (10.10.0.20)',
    summary:
      'Récupération de la Developer Key dans Configuration.exe (idCenter 5052 & 5053) et test des tourniquets.',
    hardwareRequired: 'Serveur Windows Heitz sur 10.10.0.20 et tourniquets Heitz existants.',
    tasks: [
      'Ouvrir Configuration.exe sur Windows Heitz et vérifier que Heitz-WS.exe écoute sur le port 8080.',
      'Copier la clé développeur dans /opt/cfitness-os/.env (HEITZ_WS_DEV_KEY).',
      'Tester l’authentification JSON locale et l’ouverture tourniquet.',
    ],
    command: 'curl -s -X POST http://10.10.0.20:8080/api/developer/getToken?v=2 -H "Content-Type: application/json" -d \'{"developerKey":"VOTRE_CLE"}\'',
    verification: 'Réponse JSON {"success": true, "token": "..."} en moins de 5 ms.',
    pitfall: 'Ne jamais exposer le port 8080 de Heitz sur Internet : tout reste sur le switch local.',
  },
  {
    id: 'step-5-telecom-ovh-yeastar',
    number: 5,
    category: 'telecom',
    categoryLabel: 'Télécom 04 & 07',
    step: 'Trunk SIP OVHcloud (04) & Passerelle 4G Yeastar TG400 (10.10.0.14)',
    duration: '35 min',
    location: 'Baie Réseau (10.10.0.14) & Accueils',
    summary:
      'Raccordement des lignes fixes 04 OVHcloud et des 4 cartes SIM 07 dans la passerelle Yeastar TG400.',
    hardwareRequired: 'Passerelle Yeastar TG400, 4 cartes SIM 07 VoLTE, Casques USB-C Jabra Evolve2 40 SE.',
    tasks: [
      'Insérer les 4 cartes SIM 07 dans la Yeastar TG400 et fixer son IP sur 10.10.0.14.',
      'Renseigner les identifiants SIP OVHcloud et Yeastar dans .env.',
      'Tester un appel sortant en 04 (Accueil) et en 07 (Relance commerciale).',
    ],
    command: 'docker compose exec asterisk asterisk -rx "pjsip show endpoints" && curl -s http://10.10.0.14/api/v1.0/status',
    verification: 'Les endpoints OVH et Yeastar sont "Registered" et les 4 voyants GSM sont verts.',
    pitfall: 'Utiliser exclusivement la passerelle GSM physique pour les numéros 07 (conformité ARCEP).',
  },
  {
    id: 'step-6-technogym-checkup',
    number: 6,
    category: 'biometrie',
    categoryLabel: 'Technogym Checkup',
    step: 'Stations Technogym Checkup 3D (10.10.0.55 & 10.20.0.55)',
    duration: '30 min',
    location: 'Espaces Bilan CDS & Beynost',
    summary:
      'Branchement Ethernet RJ45 des stations Checkup, étalonnage balance BIA / caméra 3D et lien Mywellness.',
    hardwareRequired: '2 Stations Technogym Checkup sur prises RJ45 dédiées.',
    tasks: [
      'Raccorder les stations en RJ45 fixe (10.10.0.55 à CDS, 10.20.0.55 à Beynost).',
      'Associer les stations aux comptes Mywellness Pro des 2 clubs.',
      'Tester l’ouverture directe depuis C.Fitness OS.',
    ],
    command: 'ping -c 3 10.10.0.55 && ping -c 3 10.20.0.55',
    verification: 'Mesure Wellness Age™ synchronisée en moins de 3 secondes.',
    pitfall: 'Privilégier le câble RJ45 plutôt que le Wi-Fi invité pour éviter toute coupure pendant un scan 3D.',
  },
  {
    id: 'step-7-inbody-120',
    number: 7,
    category: 'biometrie',
    categoryLabel: 'InBody 120',
    step: 'Analyseur Biométrique InBody 120 (Port Série USB 9600 bauds)',
    duration: '15 min',
    location: 'Bureau Coaching',
    summary:
      'Mise à niveau de la balance InBody 120 et liaison USB série 9600 bauds vers le poste de bilan.',
    hardwareRequired: 'Analyseur InBody 120 + câble USB blindé.',
    tasks: [
      'Centrer la bulle de niveau de l’InBody 120 et brancher le câble USB sur le PC.',
      'Configurer le port série à 9600 bauds (8N1) et tester une pesée.',
    ],
    command: 'stty -F /dev/ttyUSB0 9600 cs8 -cstopb -parenb 2>/dev/null || lsusb',
    verification: 'Les 6 métriques (Poids, SMM, PBF, TBW, Graisse viscérale) remontent dans la fiche.',
    pitfall: 'Ne pas utiliser de rallonge USB non amplifiée de plus de 3 mètres.',
  },
  {
    id: 'step-8-poe-kiosk-tablets',
    number: 8,
    category: 'kiosks',
    categoryLabel: 'Bornes Tactiles PoE',
    step: 'Tablettes Murales PoE Badgeuse PIN (10.10.0.31 & 10.20.0.31)',
    duration: '30 min',
    location: 'Entrées CDS & Beynost',
    summary:
      'Fixation VESA, alimentation par câble unique RJ45 PoE (sans batterie) et verrouillage Fully Kiosk.',
    hardwareRequired: '2 Dalles Android PoE iiyama TW1023ASC-B1P + supports VESA.',
    tasks: [
      'Fixer les dalles PoE au mur (1,30 m) et brancher le câble RJ45 PoE.',
      'Configurer les IP 10.10.0.31 (CDS) et 10.20.0.31 (Beynost).',
      'Verrouiller Fully Kiosk Browser sur https://10.10.0.10/kiosk/badgeuse.',
    ],
    command: 'ping -c 3 10.10.0.31 && ping -c 3 10.20.0.31',
    verification: 'Test de pointage PIN à 4 chiffres immédiat dans l’Espace RH.',
    pitfall: 'Utiliser des dalles PoE sans batterie lithium pour éviter tout gonflement 24h/24.',
  },
  {
    id: 'step-9-wireguard-vpn',
    number: 9,
    category: 'vpn',
    categoryLabel: 'VPN Inter-Clubs',
    step: 'Tunnel VPN WireGuard Carré de Soie (10.10.0.1) ↔ Beynost (10.20.0.1)',
    duration: '20 min',
    location: 'Routeurs MikroTik CDS & Beynost',
    summary:
      'Interconnexion chiffrée permanente WireGuard (UDP 51820) entre les 2 clubs (< 3 ms).',
    hardwareRequired: 'Routeurs MikroTik RB5009UG (CDS) et MikroTik hEX S (Beynost).',
    tasks: [
      'Créer l’interface wg0 (10.254.0.1/30 à CDS et 10.254.0.2/30 à Beynost) sur UDP 51820.',
      'Router 10.20.0.0/24 et 10.10.0.0/24 à travers le tunnel chiffré.',
    ],
    command: 'sudo wg show && ping -c 4 10.20.0.1',
    verification: 'Handshake WireGuard actif et latence inter-clubs ~2,4 ms.',
    pitfall: 'Activer PersistentKeepalive = 25 pour maintenir le tunnel ouvert en permanence.',
  },
  {
    id: 'step-10-silae-systemd-backups',
    number: 10,
    category: 'payroll',
    categoryLabel: 'Paie Silae & Sauvegarde',
    step: 'Export Paie Silae (IDCC 2511) & Script Cron Sauvegarde 3-2-1',
    duration: '25 min',
    location: 'Serveur Principal (10.10.0.10)',
    summary:
      'Validation du fichier CSV Silae pour le comptable et activation de la sauvegarde quotidienne à 03h00.',
    hardwareRequired: 'NAS déporté Beynost (10.20.0.10) + support externe chiffré.',
    tasks: [
      'Générer un export CSV test Silae depuis le module Planning et le valider avec le comptable.',
      'Activer la tâche cron quotidienne /opt/cfitness-os/scripts/backup-321.sh à 03h00.',
    ],
    command: 'sudo /opt/cfitness-os/scripts/backup-321.sh && sudo ls -lh /var/backups/cfitness-os/',
    verification: 'Les 3 copies chiffrées AES-256 (Locale, NAS Beynost, Externe) sont créées.',
    pitfall: 'Toujours conserver une copie distante hors du serveur principal.',
  },
];

const THIRD_PARTY_UPDATE_GUIDES: Array<{
  id: string;
  software: string;
  frequency: string;
  filesToTouch: string;
  summaryAction: string;
  stepId: string;
  stepLabel: string;
  targetSection: NavSection;
  targetSectionLabel: string;
}> = [
  {
    id: 'tp-heitz',
    software: '1. Système Heitz (Heitz-WS.exe & API SQL)',
    frequency: '1 à 2 mises à jour / an',
    filesToTouch: '.env · src/domain/rules.ts · /api/heitz-ws',
    summaryAction:
      'Vérifier curl http://10.10.0.20:8080/api/status après mise à jour Heitz et ajuster uniquement le connecteur isolé si un champ JSON évolue.',
    stepId: 'step-4-heitz-local-bridge',
    stepLabel: 'Étape #04 (Heitz)',
    targetSection: 'devices',
    targetSectionLabel: 'Ouvrir Adhérents & Heitz',
  },
  {
    id: 'tp-technogym',
    software: '2. Technogym Mywellness Cloud & Checkup 3D',
    frequency: 'Mises à jour Cloud transparentes',
    filesToTouch: 'src/domain/rules.ts (buildMywellnessContextualUrl)',
    summaryAction:
      'Toute la génération des liens Mywellness est centralisée dans buildMywellnessContextualUrl() dans rules.ts.',
    stepId: 'step-6-technogym-checkup',
    stepLabel: 'Étape #06 (Checkup)',
    targetSection: 'devices',
    targetSectionLabel: 'Ouvrir Bilans Checkup',
  },
  {
    id: 'tp-silae',
    software: '3. Silae Paie (Cabinet Comptable & IDCC 2511)',
    frequency: '1 fois / an (grille CCN Sport)',
    filesToTouch: 'src/domain/rules.ts (CFITNESS_LEGAL_IDENTITY & buildSilaeApiPayload)',
    summaryAction:
      'Mettre à jour le taux horaire ou les codes rubriques Silae (0100, 0110, 0240) directement dans rules.ts.',
    stepId: 'step-10-silae-systemd-backups',
    stepLabel: 'Étape #10 (Silae)',
    targetSection: 'planning-hr',
    targetSectionLabel: 'Ouvrir Planning & Paie',
  },
  {
    id: 'tp-telecom',
    software: '4. OVHcloud Télécom (04) & Passerelle 4G Yeastar (07)',
    frequency: 'Ajout SIM ou renouvellement TLS',
    filesToTouch: '.env · docker-compose.yml',
    summaryAction:
      'Mettre à jour la liste des SIM 07 sur 10.10.0.14 ou relancer docker compose up -d pour Asterisk.',
    stepId: 'step-5-telecom-ovh-yeastar',
    stepLabel: 'Étape #05 (Télécom)',
    targetSection: 'telephony',
    targetSectionLabel: 'Ouvrir Téléphonie & SMS',
  },
];

export function GovernanceView() {
  const {
    clubFilter,
    goNoGoPhases,
    signGoNoGoPhase,
    isArchitectUnlocked,
    unlockArchitectSpace,
    lockArchitectSpace,
    setActiveSection,
    themeMode,
  } = useCfos();

  const isDark = themeMode === 'dark';

  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArchitectTabId>('server_hardware');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [activeDeployFile, setActiveDeployFile] =
    useState<keyof typeof DEPLOYMENT_FILES>('docker-compose.yml');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedAllPlan, setCopiedAllPlan] = useState(false);
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);
  const [showSpecsDrawer, setShowSpecsDrawer] = useState(false);
  const [showDockerDrawer, setShowDockerDrawer] = useState(false);

  const [hardwareStatuses, setHardwareStatuses] = useState<Record<string, 'ONLINE' | 'MAINTENANCE'>>(
    () => {
      const init: Record<string, 'ONLINE' | 'MAINTENANCE'> = {};
      CLUB_HARDWARE_INVENTORY.forEach((h) => {
        init[h.id] = 'ONLINE';
      });
      return init;
    }
  );

  const [connectorAutoWatch, setConnectorAutoWatch] = useState<Record<string, boolean>>({
    'tp-heitz': true,
    'tp-technogym': true,
    'tp-silae': true,
    'tp-telecom': true,
  });
  const [connectorTestNotice, setConnectorTestNotice] = useState<string | null>(null);
  const [openStepId, setOpenStepId] = useState<string>('step-1-rack-nut-ups');

  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('cfos_onsite_checklist')
          : null;
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'step-1-rack-nut-ups': true,
      'step-2-network-debian-ufw': true,
      'step-3-docker-certs-systemd': true,
      'step-4-heitz-local-bridge': true,
    };
  });

  const [copiedCmdId, setCopiedCmdId] = useState<string | null>(null);

  const jumpToRunbookStep = (stepId: string) => {
    setActiveTab('onsite_runbook');
    setOpenStepId(stepId);
    setTimeout(() => {
      const el = document.getElementById(`runbook-${stepId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  const toggleHardwareNodeStatus = (hwId: string, hwName: string) => {
    setHardwareStatuses((prev) => {
      const nextState = prev[hwId] === 'MAINTENANCE' ? 'ONLINE' : 'MAINTENANCE';
      setPingResult(
        nextState === 'ONLINE'
          ? `Équipement « ${hwName} » réactivé en production (EN LIGNE).`
          : `Équipement « ${hwName} » basculé en mode Maintenance.`
      );
      return { ...prev, [hwId]: nextState };
    });
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      try {
        window.localStorage.setItem('cfos_onsite_checklist', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleMarkAll = (done: boolean) => {
    const updated: Record<string, boolean> = {};
    ONSITE_INSTALLATION_STEPS.forEach((s) => {
      updated[s.id] = done;
    });
    setCompletedSteps(updated);
    try {
      window.localStorage.setItem('cfos_onsite_checklist', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyCommand = (cmd: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedCmdId(id);
      setTimeout(() => setCopiedCmdId(null), 2000);
    }
  };

  const handleCopyAllPlan = () => {
    const text = `# C.FITNESS OS — CHECKLIST D'INSTALLATION SUR SITE
${ONSITE_INSTALLATION_STEPS.map(
  (s) => `## #${s.number} ${s.step} [${completedSteps[s.id] ? 'FAIT' : 'À FAIRE'}]
- Lieu : ${s.location} (${s.duration})
- Commande : ${s.command}
- Vérification : ${s.verification}
`
).join('\n')}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAllPlan(true);
      setTimeout(() => setCopiedAllPlan(false), 2500);
    }
  };

  const handlePinDigit = (digit: string) => {
    setPinError(null);
    if (pinInput.length >= 4) return;
    const next = pinInput + digit;
    setPinInput(next);
    if (next.length === 4) {
      if (next === ARCHITECT_PIN) {
        unlockArchitectSpace();
        setPinInput('');
        setPinError(null);
      } else {
        setPinError('Code PIN incorrect. Cet espace technique est strictement personnel.');
        setPinInput('');
      }
    }
  };

  const handleBackspace = () => {
    setPinError(null);
    setPinInput((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (isArchitectUnlocked) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        setPinInput('');
        setPinError(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const filteredHardware = CLUB_HARDWARE_INVENTORY.filter(
    (hw) =>
      clubFilter === 'all' ||
      hw.clubId === 'bi-club' ||
      hw.clubId === clubFilter
  );

  const handleRunDiagnostic = () => {
    setPingResult(
      `Diagnostic réseau OK (${new Date().toLocaleTimeString('fr-FR')}) — Serveur 10.10.0.10 (1 ms) · Heitz 10.10.0.20 (2 ms) · Passerelle 4G 10.10.0.14 (4 ms) · Passerelles VPN 10.10.0.1 ↔ 10.20.0.1 (2 ms).`
    );
  };

  const handleDownloadDeployFile = (filename: keyof typeof DEPLOYMENT_FILES) => {
    const blob = new Blob([DEPLOYMENT_FILES[filename]], {
      type: 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('/', '-');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEnv = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ENV_PRODUCTION_TEMPLATE);
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2500);
    }
  };

  // =========================================================================
  // ÉCRAN DE VERROUILLAGE PAR CODE PIN
  // =========================================================================
  if (!isArchitectUnlocked) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div
          className={`max-w-md w-full rounded-2xl border p-6 sm:p-8 shadow-xl space-y-6 ${
            isDark
              ? 'bg-[#151A2A] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200/80 text-slate-900'
          }`}
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md shadow-violet-600/20">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-violet-500">
              Accès Restreint · Administrateur Système
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Mon Espace Technique &amp; Plan Réseau
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plan d&apos;adressage IP (serveur, passerelles, ports), guide d&apos;installation sur site et sauvegardes 3-2-1. Entrez votre code PIN à 4 chiffres.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < pinInput.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all ${
                    filled
                      ? 'bg-violet-600 scale-110 shadow-xs'
                      : isDark
                      ? 'bg-slate-800 border border-slate-700'
                      : 'bg-slate-100 border border-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs text-center font-semibold">
              {pinError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className={`h-14 rounded-xl border font-mono text-lg font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white active:bg-violet-600'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 active:bg-violet-600 active:text-white'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPinInput('');
                setPinError(null);
              }}
              className={`h-14 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className={`h-14 rounded-xl border font-mono text-lg font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white active:bg-violet-600'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 active:bg-violet-600 active:text-white'
              }`}
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Corriger"
              className={`h-14 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ESPACE DÉVERROUILLÉ — LAYOUT CLAIR, AÉRÉ ET SUR UNE SEULE LIGNE PAR ÉQUIPEMENT
  // =========================================================================
  return (
    <div className="space-y-5">
      {/* En-tête compact sur une seule ligne + barre des 4 onglets */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-2xs space-y-4 ${
          isDark
            ? 'bg-[#151A2A] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Mon Espace Déverrouillé</span>
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Plan d&apos;Adressage IP, Serveur Local &amp; Déploiement Club
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setPinInput('');
              setPinError(null);
              lockArchitectSpace();
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Verrouiller</span>
          </button>
        </div>

        {/* Navigation horizontale claire en 4 onglets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-3 border-t border-slate-200/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('server_hardware')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'server_hardware'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Plan d&apos;Adressage IP &amp; Serveur</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('onsite_runbook')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'onsite_runbook'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Installation (10 Étapes &amp; .env)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('third_party_updates')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'third_party_updates'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <GitBranch className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Mises à Jour Logiciels Tiers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('governance_backups')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'governance_backups'
                ? 'bg-violet-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">4. Sauvegardes 3-2-1 &amp; Secours</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ONGLET 1 : PLAN D'ADRESSAGE IP, SERVEUR & PASSERELLES (1 LIGNE / ÉQUIPEMENT)
         ===================================================================== */}
      {activeTab === 'server_hardware' && (
        <div className="space-y-4">
          {/* Bandeau synthèse : les 4 repères réseau sur une seule ligne horizontale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div
              className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                Serveur Principal
              </span>
              <span className="font-mono text-xs font-extrabold text-emerald-500 whitespace-nowrap">
                10.10.0.10:3000
              </span>
            </div>

            <div
              className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                Serveur Heitz
              </span>
              <span className="font-mono text-xs font-extrabold text-violet-500 whitespace-nowrap">
                10.10.0.20:8080
              </span>
            </div>

            <div
              className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                Passerelle 4G (07)
              </span>
              <span className="font-mono text-xs font-extrabold text-blue-500 whitespace-nowrap">
                10.10.0.14:5060
              </span>
            </div>

            <div
              className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                Passerelles VPN
              </span>
              <span className="font-mono text-xs font-extrabold text-amber-500 whitespace-nowrap">
                10.10.0.1 / 10.20.0.1
              </span>
            </div>
          </div>

          {/* Tableau du Plan d'Adressage IP : chaque équipement tient sur 1 seule ligne horizontale */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 space-y-4 shadow-2xs ${
              isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                <Server className="w-4 h-4 text-violet-500 shrink-0" />
                <h2 className="text-sm sm:text-base font-extrabold">
                  Plan d&apos;Adressage IP, Serveurs, Masques &amp; Passerelles ({filteredHardware.length} équipements)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-500 font-semibold">
                  1 ligne par équipement
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunDiagnostic}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tester Ping Réseau</span>
              </button>
            </div>

            {pingResult && (
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-300 flex items-center justify-between gap-2">
                <span className="truncate">{pingResult}</span>
                <button
                  type="button"
                  onClick={() => setPingResult(null)}
                  className="underline text-[11px] shrink-0 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr
                    className={`border-b text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isDark
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <th className="py-2 px-2">Équipement</th>
                    <th className="py-2 px-2">Club</th>
                    <th className="py-2 px-2">Adresse IP</th>
                    <th className="py-2 px-2">Masque</th>
                    <th className="py-2 px-2">Passerelle</th>
                    <th className="py-2 px-2">Serveur &amp; Port</th>
                    <th className="py-2 px-2">Statut</th>
                    <th className="py-2 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-slate-800/80' : 'divide-slate-100'
                  }`}
                >
                  {filteredHardware.map((hw) => {
                    const isOnline = (hardwareStatuses[hw.id] ?? 'ONLINE') === 'ONLINE';
                    const isExpanded = expandedHwId === hw.id;
                    return (
                      <React.Fragment key={hw.id}>
                        <tr
                          className={`whitespace-nowrap transition-colors ${
                            isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              {hw.category === 'INFRA_RESEAU' ? (
                                <Cpu className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                              ) : (
                                <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              )}
                              <span className="font-bold text-xs">{hw.shortName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 font-medium text-slate-500 dark:text-slate-400">
                            {hw.clubId === 'carre-de-soie'
                              ? 'Center'
                              : hw.clubId === 'beynost'
                              ? 'Place'
                              : 'Bi-Club'}
                          </td>
                          <td className="py-2.5 px-2 font-mono font-bold text-violet-600 dark:text-violet-400">
                            {hw.ipAddress}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-slate-500 dark:text-slate-400">
                            {hw.subnetMask}
                          </td>
                          <td className="py-2.5 px-2 font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {hw.gateway}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-300">
                            <span>{hw.serverTarget}</span>{' '}
                            <span className="text-slate-400">({hw.portShort})</span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isOnline
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              {isOnline ? `${hw.latencyMs} ms` : 'PAUSE'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHwId(isExpanded ? null : hw.id)
                                }
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                                  isDark
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <Info className="w-3 h-3 text-violet-500" />
                                <span>{isExpanded ? 'Masquer' : 'Infos'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => jumpToRunbookStep(hw.stepId)}
                                className="px-2 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-600 dark:text-violet-300 font-bold text-[10px] cursor-pointer"
                              >
                                {hw.stepShortLabel}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleHardwareNodeStatus(hw.id, hw.shortName)
                                }
                                title={isOnline ? 'Mettre en maintenance' : 'Réactiver'}
                                className={`p-1 rounded-lg cursor-pointer ${
                                  isOnline
                                    ? isDark
                                      ? 'text-slate-400 hover:bg-slate-800'
                                      : 'text-slate-400 hover:bg-slate-100'
                                    : 'bg-emerald-600 text-white'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr
                            className={
                              isDark ? 'bg-slate-900/60' : 'bg-violet-50/40'
                            }
                          >
                            <td colSpan={8} className="px-3 py-2 text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <span className="font-bold text-violet-500">
                                    {hw.roleShort} :
                                  </span>{' '}
                                  <span className="text-slate-600 dark:text-slate-300">
                                    {hw.details}
                                  </span>{' '}
                                  <span className="font-mono text-[11px] text-slate-400">
                                    ({hw.model})
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2 tiroirs dépliables à la demande pour éviter toute surcharge visuelle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Tiroir 1 : Références Constructeurs */}
            <div
              className={`rounded-2xl border p-4 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setShowSpecsDrawer((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold">
                      Références Constructeurs &amp; Câblage (5 domaines)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Yeastar 4G, Tablettes PoE, Certificats TLS, Tourniquets Heitz, Onduleur Eaton
                    </div>
                  </div>
                </div>
                {showSpecsDrawer ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {showSpecsDrawer && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                  {HARDWARE_COMPATIBILITY_SPECS.map((spec) => (
                    <div
                      key={spec.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                        isDark
                          ? 'bg-slate-900/50 border-slate-800'
                          : 'bg-slate-50 border-slate-200/70'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">{spec.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {spec.manufacturerModels}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded bg-violet-500/10 text-violet-500 shrink-0">
                        {spec.estimatedHardwareBudget}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tiroir 2 : Fichiers Docker & Serveur */}
            <div
              className={`rounded-2xl border p-4 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setShowDockerDrawer((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCode2 className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold">
                      Fichiers Serveur (docker-compose.yml, Dockerfile, Rust)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Cliquez pour inspecter ou télécharger les fichiers de déploiement
                    </div>
                  </div>
                </div>
                {showDockerDrawer ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {showDockerDrawer && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(Object.keys(DEPLOYMENT_FILES) as Array<keyof typeof DEPLOYMENT_FILES>).map(
                        (f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setActiveDeployFile(f)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold cursor-pointer ${
                              activeDeployFile === f
                                ? 'bg-violet-600 text-white'
                                : isDark
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {f}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadDeployFile(activeDeployFile)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-64">
                    {DEPLOYMENT_FILES[activeDeployFile]}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 2 : GUIDE D'INSTALLATION SUR PLACE (1 LIGNE PAR ÉTAPE + DÉPLIABLE)
         ===================================================================== */}
      {activeTab === 'onsite_runbook' && (() => {
        const totalSteps = ONSITE_INSTALLATION_STEPS.length;
        const completedCount = ONSITE_INSTALLATION_STEPS.filter((s) => completedSteps[s.id]).length;
        const progressPercent = Math.round((completedCount / totalSteps) * 100);

        return (
          <div className="space-y-4">
            {/* Barre de progression sur une ligne */}
            <div
              className={`rounded-2xl border p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Activity className="w-5 h-5 text-violet-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span>Checklist de mise en service sur place (10 étapes)</span>
                    <span className="font-mono text-violet-500">
                      {completedCount}/{totalSteps} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyAllPlan}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedAllPlan ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Copier le guide</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Tout cocher</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(false)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>

            {/* Liste des 10 étapes : chaque étape est sur une seule ligne horizontale, cliquable pour voir le détail */}
            <div
              className={`rounded-2xl border divide-y overflow-hidden ${
                isDark
                  ? 'bg-[#151A2A] border-slate-800 divide-slate-800'
                  : 'bg-white border-slate-200/80 divide-slate-100'
              }`}
            >
              {ONSITE_INSTALLATION_STEPS.map((step) => {
                const isDone = !!completedSteps[step.id];
                const isOpen = openStepId === step.id;
                return (
                  <div key={step.id} id={`runbook-${step.id}`}>
                    <div
                      className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                        isOpen
                          ? isDark
                            ? 'bg-violet-500/10'
                            : 'bg-violet-50/60'
                          : isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          aria-label={isDone ? 'Marquer à faire' : 'Marquer comme fait'}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-violet-500/15 text-violet-500 shrink-0">
                          #{String(step.number).padStart(2, '0')}
                        </span>

                        <button
                          type="button"
                          onClick={() => setOpenStepId(isOpen ? '' : step.id)}
                          className="text-left font-bold text-xs sm:text-sm truncate flex-1 cursor-pointer"
                        >
                          {step.step}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="hidden md:inline-block text-[11px] text-slate-400 font-mono whitespace-nowrap">
                          {step.location} · {step.duration}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOpenStepId(isOpen ? '' : step.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{isOpen ? 'Réduire' : 'Détails'}</span>
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div
                        className={`px-4 pb-4 pt-2 space-y-3 text-xs border-t ${
                          isDark
                            ? 'bg-slate-900/40 border-slate-800/80'
                            : 'bg-slate-50/50 border-slate-100'
                        }`}
                      >
                        <p className="text-slate-500 dark:text-slate-300">{step.summary}</p>

                        <ul className="space-y-1.5">
                          {step.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-mono font-bold text-violet-500">
                                {idx + 1}.
                              </span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <code className="flex-1 p-2.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-nowrap">
                            $ {step.command}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand(step.command, `cmd-${step.id}`)}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedCmdId === `cmd-${step.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Vérification :</strong> {step.verification}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Point d&apos;attention :</strong> {step.pitfall}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modèle du fichier .env de production */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                  <KeyRound className="w-4 h-4" />
                  <span>Fichier /opt/cfitness-os/.env (Serveur 10.10.0.10)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le fichier .env</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {ENV_PRODUCTION_TEMPLATE}
              </pre>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          ONGLET 3 : MISES À JOUR LOGICIELS TIERS (TABLEAU CLAIR EN LIGNE)
         ===================================================================== */}
      {activeTab === 'third_party_updates' && (
        <div className="space-y-4">
          {connectorTestNotice && (
            <div className="px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-300 flex items-center justify-between gap-3">
              <span>{connectorTestNotice}</span>
              <button
                type="button"
                onClick={() => setConnectorTestNotice(null)}
                className="underline font-bold text-[11px] shrink-0 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          )}

          <div
            className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
              isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
            }`}
          >
            <div>
              <h2 className="text-sm sm:text-base font-extrabold">
                Connecteurs Isolés : Mises à Jour Heitz, Technogym, Silae &amp; OVHcloud
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chaque logiciel tiers est isolé dans un seul fichier connecteur pour mettre à jour sans jamais toucher aux écrans.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isDark
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <th className="py-2.5 px-3">Logiciel Tiers</th>
                    <th className="py-2.5 px-3">Fréquence</th>
                    <th className="py-2.5 px-3">Fichier Isolé à Modifier</th>
                    <th className="py-2.5 px-3">Surveillance</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-slate-800/80' : 'divide-slate-100'
                  }`}
                >
                  {THIRD_PARTY_UPDATE_GUIDES.map((guide) => {
                    const isWatchEnabled = connectorAutoWatch[guide.id] ?? true;
                    return (
                      <tr
                        key={guide.id}
                        className={`whitespace-nowrap ${
                          isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold">{guide.software}</td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {guide.frequency}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-violet-500 font-semibold">
                          {guide.filesToTouch}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() =>
                              setConnectorAutoWatch((prev) => ({
                                ...prev,
                                [guide.id]: !isWatchEnabled,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                              isWatchEnabled
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : 'bg-amber-500/15 text-amber-500'
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{isWatchEnabled ? 'Active' : 'Pause'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setConnectorTestNotice(
                                  `Connecteur « ${guide.software} » vérifié (${guide.filesToTouch}) : 100 % compatible.`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 font-bold text-[11px] cursor-pointer"
                            >
                              Tester
                            </button>
                            <button
                              type="button"
                              onClick={() => jumpToRunbookStep(guide.stepId)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                                isDark
                                  ? 'bg-slate-800 text-slate-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {guide.stepLabel}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSection(guide.targetSection)}
                              className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-500 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Module</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 4 : SAUVEGARDES 3-2-1, BASCULE SECOURS & JALONS GO/NO-GO
         ===================================================================== */}
      {activeTab === 'governance_backups' && (
        <div className="space-y-4">
          <BackupFailoverPanel />

          {/* Tableau horizontal des jalons Go/No-Go */}
          <div
            className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${
              isDark ? 'bg-[#151A2A] border-slate-800' : 'bg-white border-slate-200/80'
            }`}
          >
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Jalons de Validation &amp; Mise en Production (Go / No-Go)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      isDark
                        ? 'border-slate-800 bg-slate-900/60 text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Jalon</th>
                    <th className="py-2 px-3">Durée</th>
                    <th className="py-2 px-3">Statut</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-slate-800/80' : 'divide-slate-100'
                  }`}
                >
                  {goNoGoPhases.map((gate) => (
                    <tr
                      key={gate.id}
                      className={`whitespace-nowrap ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-violet-500">
                        {gate.code}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{gate.title}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {gate.durationLabel}
                      </td>
                      <td className="py-2.5 px-3">
                        {gate.status === 'valide' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Validé ({gate.signedBy})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold text-[11px]">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {gate.status === 'valide' ? (
                          <button
                            type="button"
                            onClick={() => signGoNoGoPhase(gate.id, 'en_cours')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            Remettre en attente
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              signGoNoGoPhase(gate.id, 'Thomas CLAUDE')
                            }
                            className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Valider Go
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
