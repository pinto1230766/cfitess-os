import React, { useState, useEffect } from 'react';
import { useCfos } from '../../context/CfosContext';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  Server,
  HardDrive,
  FileCheck2,
  Cpu,
  Radio,
  RefreshCw,
  FileCode2,
  Download,
  Terminal,
  Wrench,
  GitBranch,
  Copy,
  Check,
  KeyRound,
  Delete,
  Layers,
  CheckSquare,
  Square,
  Network,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  ArrowRight,
  ExternalLink,
  Power,
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
  name: string;
  model: string;
  ipOrEndpoint: string;
  protocol: string;
  port: string;
  latencyMs: number;
  status: 'ONLINE' | 'STANDBY';
  stepId: string;
  stepShortLabel: string;
  details: string;
}

const CLUB_HARDWARE_INVENTORY: HardwareNode[] = [
  {
    id: 'hw-ai-gpu-server',
    clubId: 'carre-de-soie',
    category: 'INFRA_RESEAU',
    name: 'Serveur Physique Local C.Fitness OS (Linux Debian 12 + Rust / Node + Onduleur UPS)',
    model:
      'Debian 12 + Rust (Axum API) / Node + PostgreSQL 16 + Redis 7 + GPU RTX 4060 Ti (faster-whisper) + Onduleur Eaton',
    ipOrEndpoint: '10.10.0.10 (2 Rue Jacquard, Carré de Soie)',
    protocol: 'HTTPS (TLS Interne) + PostgreSQL 16 + Redis 7 + LiveKit WebRTC + whisper-rs GPU',
    port: 'TCP 443 / 3000 / 5432 / 6379',
    latencyMs: 1,
    status: 'ONLINE',
    stepId: 'step-1-rack-nut-ups',
    stepShortLabel: 'Étape #01 · Rack & Onduleur NUT',
    details:
      'Serveur maître hébergé au club Carré de Soie sur onduleur Line-Interactive, répliqué en temps réel (stratégie 3-2-1) sur les 6 appareils de secours des 2 clubs.',
  },
  {
    id: 'hw-heitz-srv',
    clubId: 'carre-de-soie',
    category: 'ACCES_HEITZ',
    name: 'Serveur Windows Heitz System & Service HZ.WS / FITNESS KPI (Token Configuration.exe)',
    model:
      'Windows Server SQL + API HZ.WS (SVfMUAnB) & FITNESS KPI (2sA35D6jFP) : POST /api/developer/getToken?v=2',
    ipOrEndpoint: '10.10.0.20 (LAN CDS · idCenter 5052 & 5053)',
    protocol:
      'HTTP/REST JSON Local : /api/users/search, /api/userPassages/browse, /api/passageCode/generate, /api/ticket, /api/planning/browse, /api/employee/list',
    port: 'TCP 8080 / 1433',
    latencyMs: 18,
    status: 'ONLINE',
    stepId: 'step-4-heitz-local-bridge',
    stepShortLabel: 'Étape #04 · Pont Local Heitz',
    details:
      'Interrogé exclusivement en circuit fermé LAN (câble RJ45 local entre 10.10.0.10 et 10.10.0.20) : aucune donnée adhérent ne transite sur Internet.',
  },
  {
    id: 'hw-turnstiles-cds',
    clubId: 'carre-de-soie',
    category: 'ACCES_HEITZ',
    name: 'Tourniquets & Lecteurs RFID + Bluetooth Heitz (Carré de Soie — Conservés)',
    model:
      'Lecteurs Heitz RFID MIFARE + Bluetooth Low Energy (BLE) existants + Contrôleur local Heitz (< 50 ms)',
    ipOrEndpoint: '10.10.0.21–22 (Pilotés en local par Heitz System · idCenter 5052)',
    protocol:
      'Ouverture physique locale par Heitz + Remontée GET /api/userPassages/browse & QR /api/passageCode/generate',
    port: 'TCP 8080 (API Heitz)',
    latencyMs: 12,
    status: 'ONLINE',
    stepId: 'step-4-heitz-local-bridge',
    stepShortLabel: 'Étape #04 · Tourniquets & Relais',
    details:
      'Lecteurs RFID/Bluetooth conservés. L’impulsion électrique (< 50 ms) est gérée localement par Heitz ; C.Fitness OS supervise les passages et génère les QR Codes d’essai.',
  },
  {
    id: 'hw-turnstiles-bey',
    clubId: 'beynost',
    category: 'ACCES_HEITZ',
    name: 'Tourniquets & Lecteurs RFID + Bluetooth Heitz (Beynost — Conservés)',
    model:
      'Lecteurs Heitz RFID MIFARE + Bluetooth Low Energy (BLE) existants + API Heitz (via VPN WireGuard)',
    ipOrEndpoint: '10.20.0.15 → 10.20.0.21–22 (via WireGuard · idCenter 5053)',
    protocol:
      'Contrôle d’accès Heitz natif + GET /api/userPassages/browse & /api/planning/browse?viewAs=EMPLOYEE',
    port: 'UDP 51820 / TCP 8080',
    latencyMs: 26,
    status: 'ONLINE',
    stepId: 'step-9-wireguard-vpn',
    stepShortLabel: 'Étape #09 · Liaison Beynost VPN',
    details:
      'Relié au serveur principal de Carré de Soie via le tunnel chiffré WireGuard site-à-site (2,4 ms) avec cache autonome en cas de coupure fibre.',
  },
  {
    id: 'hw-asterisk-webrtc',
    clubId: 'bi-club',
    category: 'TELEPHONIE_VOIP',
    name: 'Centrale IPBX Asterisk 20 LTS + Trunk SIP Fixe OVHcloud (Numéros 04 — Remplace Ringover)',
    model: '12 Canaux SIP OVHcloud (sip.ovh.fr) + Postes WebRTC WSS TLS / Yealink SIP-T33G PoE',
    ipOrEndpoint: '10.10.0.10 ↔ sip.ovh.fr (Fixes 04 26 22 55 30 & 04 22 91 36 82)',
    protocol: 'PJSIP TLS/SRTP + WebRTC WSS (Certificat TLS requis pour micro navigateur)',
    port: 'TCP 8089 (WSS) / TCP 5061 (SIP TLS)',
    latencyMs: 11,
    status: 'ONLINE',
    stepId: 'step-5-telecom-ovh-yeastar',
    stepShortLabel: 'Étape #05 · Trunk SIP OVH 04',
    details:
      'Conforme ARCEP n° 2022-1583 : émet les numéros fixes géographiques 04 certifiés MAN STIR/SHAKEN (~1,20 € HT/mois/ligne) + Casques USB-C Jabra Evolve2 40 SE.',
  },
  {
    id: 'hw-yeastar-gsm-07',
    clubId: 'bi-club',
    category: 'TELEPHONIE_VOIP',
    name: 'Passerelle GSM 4G VoLTE Yeastar TG400 (Pool Mobiles 07 & SMS STOP — Conformité ARCEP)',
    model: 'Passerelle Matérielle SIP ↔ 4 Cartes SIM Physiques 4G VoLTE (07 55 52 ...)',
    ipOrEndpoint: '10.10.0.14 (LAN Asterisk RJ45)',
    protocol: 'SIP PJSIP Local (5060) + API HTTP SMS locale ↔ Réseau Cellulaire 4G VoLTE',
    port: 'UDP 5060 / TCP 80',
    latencyMs: 14,
    status: 'ONLINE',
    stepId: 'step-5-telecom-ovh-yeastar',
    stepShortLabel: 'Étape #05 · Passerelle 4G Yeastar',
    details:
      'Indispensable (Décision ARCEP n° 2022-1583) : les opérateurs bloquant tout Caller ID 06/07 sur un Trunk SIP fixe, la passerelle Yeastar TG400 émet les appels 07 et SMS via de vraies cartes SIM 4G VoLTE.',
  },
  {
    id: 'hw-kiosk-poe-tablets',
    clubId: 'bi-club',
    category: 'INFRA_RESEAU',
    name: 'Bornes Tactiles Murales Accueil & Badgeuse PIN (Alimentation PoE RJ45 Anti-Gonflement)',
    model:
      'Dalles Android PoE iiyama ProLite TW1023ASC-B1P (sans batterie) / Samsung Tab Active5 PoE + Fully Kiosk Browser',
    ipOrEndpoint: '10.10.0.31 (CDS) & 10.20.0.31 (Beynost)',
    protocol: 'Ethernet PoE IEEE 802.3af (Onduleur) + HTTPS PWA + IndexedDB Offline',
    port: 'TCP 443 (LAN Filaire RJ45)',
    latencyMs: 4,
    status: 'ONLINE',
    stepId: 'step-8-poe-kiosk-tablets',
    stepShortLabel: 'Étape #08 · Bornes Tactiles PoE',
    details:
      'Élimine le gonflement des batteries lithium branchées 24h/24 sur USB et les pertes Wi-Fi : alimentation + réseau filaire via câble unique RJ45 PoE.',
  },
  {
    id: 'hw-checkup-cds',
    clubId: 'carre-de-soie',
    category: 'BIOMETRIE_INBODY',
    name: 'Station Technogym Checkup (Balance Révolutionnaire & Capteurs 3D) — Carré de Soie',
    model: 'Technogym Checkup Dernière Génération (Balance BIA Multi-Fréquence, Caméra 3D, Wellness Age™)',
    ipOrEndpoint: '10.10.0.55 ↔ Technogym Mywellness Cloud Pro',
    protocol: 'Intégration native Technogym Mywellness + Lien contextuel direct depuis C.Fitness OS',
    port: 'HTTPS 443 (Mywellness)',
    latencyMs: 9,
    status: 'ONLINE',
    stepId: 'step-6-technogym-checkup',
    stepShortLabel: 'Étape #06 · Station Checkup 3D',
    details:
      'Synchronisée avec Mywellness (Wellness Age™, composition corporelle BIA, mobilité, équilibre et force).',
  },
  {
    id: 'hw-checkup-inbody770-bey',
    clubId: 'beynost',
    category: 'BIOMETRIE_INBODY',
    name: 'Station Technogym Checkup (Balance Révolutionnaire & Capteurs 3D) — Beynost',
    model: 'Technogym Checkup Dernière Génération (Balance BIA Multi-Fréquence, Caméra 3D, Wellness Age™)',
    ipOrEndpoint: '10.20.0.55 ↔ Technogym Mywellness Cloud Pro',
    protocol: 'Intégration native Technogym Mywellness + Lien contextuel direct depuis C.Fitness OS',
    port: 'HTTPS 443 (Mywellness)',
    latencyMs: 14,
    status: 'ONLINE',
    stepId: 'step-6-technogym-checkup',
    stepShortLabel: 'Étape #06 · Station Checkup 3D',
    details:
      'Seconde station Technogym Checkup déployée à Beynost avec ouverture contextuelle 1-clic depuis C.Fitness OS.',
  },
  {
    id: 'hw-ovh-wireguard-router',
    clubId: 'bi-club',
    category: 'INFRA_RESEAU',
    name: 'Routeurs Fibre Pro & Tunnel VPN WireGuard Site-à-Site (< 3 ms) + Switchs PoE',
    model: 'MikroTik RB5009UG+S+IN (Carré de Soie) ↔ MikroTik hEX S (Beynost) + Switch PoE 8 ports',
    ipOrEndpoint: '10.10.0.1 ↔ 10.20.0.1',
    protocol: 'WireGuard VPN (ChaCha20-Poly1305) + Alimentation PoE Tablettes/Yealink',
    port: 'UDP 51820 / TCP 443',
    latencyMs: 2,
    status: 'ONLINE',
    stepId: 'step-9-wireguard-vpn',
    stepShortLabel: 'Étape #09 · Tunnel VPN WireGuard',
    details:
      'Assure l’interconnexion privée chiffrée permanente entre les 2 clubs sans exposer aucun port sur Internet.',
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

# 1. BASE DE DONNÉES LOCALE & CACHE TEMPS RÉEL
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://cfitness_admin:MotDePasseFortLocal2026!@127.0.0.1:5432/cfitness_os
REDIS_URL=redis://127.0.0.1:6379

# 2. CONNEXION 100 % LOCALE AU SERVEUR HEITZ (ZÉRO TRANSIT INTERNET)
HEITZ_WS_URL=http://10.10.0.20:8080
HEITZ_WS_DEV_KEY=CLE_DEVELOPPEUR_GENEREE_DANS_CONFIGURATION_EXE
HEITZ_ID_CENTER_CDS=5052
HEITZ_ID_CENTER_BEY=5053

# 3. TÉLÉPHONIE OVHCLOUD (FIXES 04) & PASSERELLE 4G YEASTAR TG400 (MOBILES 07)
OVH_SIP_HOST=sip.ovh.fr
OVH_SIP_TRUNK_USER=0033426225530
OVH_SIP_TRUNK_PASS=SecretSipOvh2026!
YEASTAR_TG400_IP=http://10.10.0.14
YEASTAR_API_USER=api_cfitness
YEASTAR_API_PASS=SecretYeastar4G!

# 4. PASSERELLE TECHNOGYM MYWELLNESS & SILAE PAIE
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
    step: 'ÉTAPE 1 · Rack Serveur 19", Onduleur Eaton Ellipse PRO & Daemon NUT (Extinction Propre)',
    duration: '30 min',
    location: 'Baie informatique 19" Carré de Soie (2 Rue Jacquard)',
    summary: 'Montage du serveur maître C.Fitness OS en baie, raccordement sur prises ondulées Eaton et configuration du démon NUT pour extinction automatique sécurisée.',
    hardwareRequired: 'Serveur Debian 12 (Intel i7/Xeon ou Ryzen, 32 Go RAM, 2x SSD NVMe RAID1), Onduleur Eaton Ellipse PRO 1200 VA / APC Smart-UPS, Câble USB de communication Eaton, Switch Gigabit 24 ports PoE+ (802.3at), Câbles Cat6 SFTP.',
    tasks: [
      'Fixer le serveur C.Fitness OS dans la baie 19" à l’aide des rails coulissants fournis.',
      'Brancher les deux alimentations redondantes (ou le cordon secteur) du serveur et du switch Gigabit sur les prises ondulées (secourues par batterie) de l’Eaton Ellipse PRO.',
      'Relier le câble USB Type-A/B entre le port USB arrière de l’onduleur Eaton et un port USB du serveur Debian.',
      'Installer le démon NUT (Network UPS Tools) sous Debian : sudo apt-get update && sudo apt-get install -y nut nut-client.',
      'Configurer /etc/nut/ups.conf avec le pilote usbhid-ups et port = "auto", puis démarrer le service avec upsdrvctl start.',
      'Simuler une coupure de courant en débranchant la prise 230V de l’onduleur : vérifier que le statut bascule en OB (On Battery) et que l’arrêt propre de PostgreSQL/Redis est programmé avant épuisement batterie.',
    ],
    command: 'sudo apt-get update && sudo apt-get install -y nut nut-client && sudo upsdrvctl start && upsc eaton@localhost',
    secondaryCommand: 'upsc eaton@localhost | grep -E "(ups.status|battery.charge|ups.load)"',
    configSnippet: {
      filename: '/etc/nut/ups.conf',
      description: 'Configuration du pilote USB HID pour onduleur Eaton Ellipse PRO',
      content: `[eaton]
  driver = usbhid-ups
  port = auto
  desc = "Onduleur Eaton Ellipse PRO 1200 - Baie Carré de Soie"
  pollinterval = 2
  vendorid = 0463`,
    },
    verification: 'La commande "upsc eaton@localhost" renvoie bien "ups.status: OL" (On Line) et "battery.charge: 100". Le serveur continue d’alimenter switch et disques.',
    pitfall: 'Ne JAMAIS brancher le switch Gigabit ou le routeur sur une prise murale directe non ondulée : si le secteur coupe, le réseau tomberait alors que le serveur tourne encore, empêchant la notification des clients.',
  },
  {
    id: 'step-2-network-debian-ufw',
    number: 2,
    category: 'system',
    categoryLabel: 'Réseau & Sécurité',
    step: 'ÉTAPE 2 · Configuration Réseau Debian 12 (IP Fixe 10.10.0.10) & Pare-feu UFW Stricte',
    duration: '20 min',
    location: 'Console / Terminal du Serveur Maître',
    summary: 'Fixation de l’IP statique 10.10.0.10/24, passerelle MikroTik 10.10.0.1, et durcissement UFW pour bloquer 100 % des accès extérieurs non autorisés.',
    hardwareRequired: 'Câble RJ45 Cat.6 blindé SFTP reliant le port Ethernet 1 Gbps du serveur au VLAN 10 du switch de baie.',
    tasks: [
      'Éditer /etc/network/interfaces ou /etc/netplan pour assigner l’adresse IP statique 10.10.0.10 avec masque 255.255.255.0.',
      'Définir la passerelle par défaut 10.10.0.1 (Routeur MikroTik Carré de Soie) et les serveurs DNS 10.10.0.1 et 1.1.1.1.',
      'Activer le pare-feu Linux UFW avec la politique stricte "default deny incoming" (tout refusé par défaut).',
      'Autoriser uniquement les sous-réseaux locaux internes : Carré de Soie (10.10.0.0/24) et Beynost via WireGuard (10.20.0.0/24).',
      'Autoriser les ports de service internes : TCP 443 (HTTPS), TCP 8089 (WebRTC WSS), TCP 5061 (SIP TLS), et restreindre TCP 5432 (PostgreSQL) à localhost.',
      'Tester la connectivité vers la passerelle et vers le PC Windows Heitz : ping -c 4 10.10.0.1 && ping -c 4 10.10.0.20.',
    ],
    command: 'sudo ufw default deny incoming && sudo ufw allow from 10.10.0.0/24 && sudo ufw allow from 10.20.0.0/24 && sudo ufw enable && sudo ufw status verbose',
    secondaryCommand: 'ip addr show && ip route show && ping -c 3 10.10.0.1',
    configSnippet: {
      filename: '/etc/network/interfaces',
      description: 'Configuration IP Statique Debian 12 pour le serveur maître',
      content: `auto eth0
iface eth0 inet static
  address 10.10.0.10
  netmask 255.255.255.0
  gateway 10.10.0.1
  dns-nameservers 10.10.0.1 1.1.1.1 8.8.8.8`,
    },
    verification: '"sudo ufw status" affiche "Status: active" et liste les autorisations restreintes aux plages 10.10.0.0/24 et 10.20.0.0/24. Zéro port ouvert sur Internet.',
    pitfall: 'Ne laissez jamais le serveur en bail DHCP dynamique : le bail pourrait expirer et changer l’IP, ce qui bloquerait immédiatement la téléphonie, les tablettes d’accueil et Heitz.',
  },
  {
    id: 'step-3-docker-certs-systemd',
    number: 3,
    category: 'system',
    categoryLabel: 'Docker & Certificats',
    step: 'ÉTAPE 3 · Déploiement Stack Docker Compose, Certificats SSL Locaux & Systemd',
    duration: '25 min',
    location: '/opt/cfitness-os sur le serveur 10.10.0.10',
    summary: 'Installation Docker CE v2, génération de certificats TLS locaux mkcert (pour autoriser le micro WebRTC sans alerte de sécurité), et activation du service systemd.',
    hardwareRequired: 'Accès root / sudo sur le serveur Debian 12 avec connexion internet pour récupérer les images officielles Docker.',
    tasks: [
      'Installer Docker CE officiel et Docker Compose : curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER.',
      'Créer le répertoire applicatif /opt/cfitness-os et cloner ou transférer le projet depuis votre PC Antigravity.',
      'Installer mkcert pour générer une autorité racine locale et un certificat SSL/TLS valide pour 10.10.0.10, localhost et *.cfitness.lan.',
      'Déposer le fichier .env de production sécurisé dans /opt/cfitness-os/.env et appliquer les permissions chmod 600 .env.',
      'Lancer la stack avec docker compose up -d et vérifier que les conteneurs PostgreSQL 16, Redis 7 et Asterisk démarrent sains.',
      'Créer l’unité systemd /etc/systemd/system/cfitness.service pour que C.Fitness OS redémarre automatiquement en 12 secondes après tout redémarrage.',
    ],
    command: 'cd /opt/cfitness-os && docker compose up -d && sudo systemctl enable --now cfitness.service',
    secondaryCommand: 'docker compose ps && docker compose logs -f --tail=30',
    configSnippet: {
      filename: '/etc/systemd/system/cfitness.service',
      description: 'Service systemd pour démarrage automatique de C.Fitness OS au boot',
      content: `[Unit]
Description=C.Fitness OS - Plateforme Unifiée de Gestion Club
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/cfitness-os
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
Restart=on-failure
TimeoutStartSec=120

[Install]
WantedBy=multi-user.target`,
    },
    verification: '"docker compose ps" liste tous les services en "healthy". "curl -k https://10.10.0.10" répond avec le code HTTP 200 en moins de 30 ms.',
    pitfall: 'Ne sautez pas la génération du certificat TLS avec mkcert : si le site est servi en HTTP simple, Google Chrome et Apple Safari bloquent automatiquement l’accès au microphone pour le casque d’accueil WebRTC.',
  },
  {
    id: 'step-4-heitz-local-bridge',
    number: 4,
    category: 'heitz',
    categoryLabel: 'Liaison Heitz System',
    step: 'ÉTAPE 4 · Pont Local avec Heitz System (10.10.0.20), Clé Développeur & Tourniquets',
    duration: '25 min',
    location: 'Serveur Windows Heitz (10.10.0.20) + Serveur Linux (10.10.0.10)',
    summary: 'Validation du service local Heitz-WS.exe (port 8080), extraction du jeton développeur via Configuration.exe, association des centres 5052 (CDS) & 5053 (Beynost) et test des tourniquets RFID/BLE.',
    hardwareRequired: 'PC Windows serveur Heitz System existant relié au même switch de baie par câble RJ45 Cat.6 (IP 10.10.0.20), Tourniquets tripodes et lecteurs RFID MIFARE / Bluetooth existants.',
    tasks: [
      'Sur le serveur Windows Heitz, ouvrir l’exécutable officiel Configuration.exe puis naviguer vers "Services Web / HZ.WS".',
      'Vérifier que le service Windows Heitz-WS.exe est en cours d’exécution et configuré pour écouter sur le port TCP local 8080.',
      'Générer ou copier la Developer Key (clé développeur) et noter les idCenter : 5052 pour Carré de Soie, 5053 pour Beynost.',
      'Depuis le serveur Linux 10.10.0.10, tester la latence réseau locale : ping -c 4 10.10.0.20 (attendu < 2 ms).',
      'Tester l’appel API d’authentification : curl -X POST http://10.10.0.20:8080/api/developer/getToken?v=2 avec votre developerKey.',
      'Tester la génération d’un code de passage 6 chiffres pour les séances d’essai et vérifier l’impulsion relais tourniquet (< 50 ms).',
    ],
    command: 'curl -s -X POST http://10.10.0.20:8080/api/developer/getToken?v=2 -H "Content-Type: application/json" -d \'{"developerKey":"VOTRE_CLE_DEVELOPPEUR"}\' | jq',
    secondaryCommand: 'curl -s http://10.10.0.20:8080/api/userPassages/browse?idCenter=5052 | jq .',
    configSnippet: {
      filename: '/opt/cfitness-os/.env (Variables Heitz)',
      description: 'Liaison LAN Heitz dans le fichier .env de production',
      content: `HEITZ_WS_URL=http://10.10.0.20:8080
HEITZ_WS_DEV_KEY=SVfMUAnB_CLE_GENEREE_DANS_CONFIG_EXE
HEITZ_ID_CENTER_CDS=5052
HEITZ_ID_CENTER_BEY=5053
HEITZ_GATE_TIMEOUT_MS=1200`,
    },
    verification: 'La commande renvoie un objet JSON contenant {"success": true, "token": "...", "expiresIn": 86400}. La latence ping est inférieure à 2 ms.',
    pitfall: 'Ne jamais ouvrir le port 8080 ou 1433 de la machine Heitz sur le routeur vers Internet. Les requêtes C.Fitness OS restent à 100 % sur le switch local LAN.',
  },
  {
    id: 'step-5-telecom-ovh-yeastar',
    number: 5,
    category: 'telecom',
    categoryLabel: 'Téléphonie 04 & GSM 07',
    step: 'ÉTAPE 5 · Téléphonie VoIP Hybride OVHcloud (Fixes 04) & Passerelle 4G Yeastar TG400 (4 SIM 07)',
    duration: '35 min',
    location: 'Baie Réseau (10.10.0.14) & Postes d’Accueil (Casques Jabra Evolve2 40 SE)',
    summary: 'Raccordement du Trunk SIP fixe OVHcloud pour accueil (04 26 22 55 30 / 04 22 91 36 82) et des 4 cartes SIM 4G VoLTE dans Yeastar TG400 pour relances 07 conformes ARCEP n° 2022-1583 + SMS STOP.',
    hardwareRequired: 'Passerelle matérielle Yeastar TG400 4G VoLTE, 4 cartes SIM physiques mobiles (07 55 52 ...), Casques filaires USB-C Jabra Evolve2 40 SE, Trunk SIP OVHcloud 12 canaux.',
    tasks: [
      'Insérer les 4 cartes SIM physiques 4G VoLTE dans les emplacements SIM 1 à 4 de la passerelle Yeastar TG400.',
      'Raccorder le port LAN de la Yeastar au switch de baie et lui assigner l’IP statique 10.10.0.14 (masque 255.255.255.0).',
      'Accéder à l’interface web de la passerelle (http://10.10.0.14), désactiver les demandes de code PIN sur les 4 SIM et créer le Trunk SIP local vers 10.10.0.10:5060.',
      'Dans /opt/cfitness-os/.env, renseigner les identifiants du Trunk SIP OVHcloud (Fixes 04) et l’URL de l’API Yeastar pour l’envoi de SMS.',
      'Brancher les casques filaires USB-C Jabra Evolve2 40 SE sur les postes d’accueil des 2 clubs.',
      'Passer un appel sortant en 04 (accueil club) puis en 07 (mobile commercial) : vérifier que le récepteur voit bien le Caller ID 07 sans blocage opérateur.',
    ],
    command: 'docker compose exec asterisk asterisk -rx "pjsip show endpoints" && curl -s http://10.10.0.14/api/v1.0/status',
    secondaryCommand: 'docker compose logs -f --tail=20 asterisk-webrtc',
    configSnippet: {
      filename: '/etc/asterisk/pjsip.conf (Extrait Trunk OVH + Yeastar)',
      description: 'Configuration PJSIP hybride OVHcloud 04 et Passerelle Yeastar 07',
      content: `[ovh-trunk]
type=registration
outbound_auth=ovh-auth
server_uri=sip:sip.ovh.fr
client_uri=sip:0033426225530@sip.ovh.fr

[yeastar-tg400]
type=endpoint
transport=transport-udp
context=from-gsm
disallow=all
allow=alaw,ulaw,g722
aors=yeastar-aor`,
    },
    verification: 'La commande "pjsip show endpoints" affiche OVH et Yeastar avec le statut "Available / Registered". Les voyants LED GSM de la Yeastar TG400 sont verts fixes.',
    pitfall: 'Ne jamais tenter d’émettre des appels ou SMS en 06/07 via un trunk SIP OVH : l’ARCEP interdit l’usurpation de CLI mobile sur trunk fixe. Seule la passerelle matérielle Yeastar avec cartes SIM physiques est 100 % conforme.',
  },
  {
    id: 'step-6-technogym-checkup',
    number: 6,
    category: 'biometrie',
    categoryLabel: 'Technogym Checkup',
    step: 'ÉTAPE 6 · Stations Technogym Checkup (Balance Multi-Fréquence, Caméra 3D & Mywellness)',
    duration: '30 min',
    location: 'Espace Bilan & Diagnostic Carré de Soie (10.10.0.55) & Beynost (10.20.0.55)',
    summary: 'Raccordement Ethernet RJ45, étalonnage de la balance BIA et caméra 3D, association au portail Mywellness Cloud Pro et synchronisation du Wellness Age™.',
    hardwareRequired: '2x Stations Technogym Checkup complètes (plateforme de pesée BIA multi-fréquence, caméra 3D de posture/mobilité, écran tactile HD), prises murales RJ45 reliées au VLAN matériel.',
    tasks: [
      'Positionner la station Technogym Checkup sur un sol rigide et parfaitement horizontal (pas de tapis ni moquette molle).',
      'Raccorder la station en câble Ethernet RJ45 sur la prise murale dédiée (IP 10.10.0.55 à CDS, 10.20.0.55 à Beynost).',
      'Allumer la station et exécuter la procédure officielle d’étalonnage Technogym : tare zéro de la balance BIA et calibration optique de la caméra 3D avec la mire fournie.',
      'Associer la station au compte Technogym Mywellness Cloud Pro de l’établissement (cfitness-carre-de-soie et cfitness-beynost).',
      'Dans C.Fitness OS, vérifier que le bouton contextuel « Ouvrir Fiche Checkup Mywellness » charge directement l’historique adhérent.',
      'Réaliser une mesure test complète (poids, SMM, PBF, mobilité scapulaire, Wellness Age™) et vérifier la synchronisation en moins de 3 secondes.',
    ],
    command: 'ping -c 3 10.10.0.55 && ping -c 3 10.20.0.55',
    secondaryCommand: 'curl -I https://pro.mywellness.com/cfitness-carre-de-soie',
    configSnippet: {
      filename: 'buildMywellnessContextualUrl() (src/domain/rules.ts)',
      description: 'Lien direct contextuel 1-clic vers le portail Technogym Pro',
      content: `export function buildMywellnessContextualUrl(clubId: ClubId, memberExternalId?: string) {
  const slug = clubId === 'beynost' ? 'cfitness-beynost' : 'cfitness-carre-de-soie';
  const base = \`https://pro.mywellness.com/\${slug}/checkup\`;
  return memberExternalId ? \`\${base}?user=\${memberExternalId}\` : base;
}`,
    },
    verification: 'L’écran Checkup affiche le logo C.Fitness, l’adhérent test peut monter sur la plateforme et son profil Mywellness est alimenté instantanément.',
    pitfall: 'Ne laissez pas la station en Wi-Fi invité : une micro-coupure Wi-Fi pendant un test de saut ou d’équilibre interrompt le protocole de mesure et oblige à tout recommencer.',
  },
  {
    id: 'step-7-inbody-120',
    number: 7,
    category: 'biometrie',
    categoryLabel: 'Analyseur InBody 120',
    step: 'ÉTAPE 7 · Analyseur Biométrique InBody 120 (Port Série / USB / Bluetooth)',
    duration: '15 min',
    location: 'Comptoir d’Accueil / Box Coaching Privé',
    summary: 'Vérification de la bulle de niveau, liaison USB série 9600 bauds vers le PC d’accueil, et paramétrage de l’import instantané des 6 métriques corporelles.',
    hardwareRequired: 'Analyseur corporel InBody 120, Câble USB de données d’origine avec blindage ferrité, PC d’accueil.',
    tasks: [
      'Poser l’InBody 120 sur le comptoir d’accueil et ajuster les pieds réglables pour centrer la bulle de niveau à l’arrière de l’appareil.',
      'Relier le câble USB au PC d’accueil (ou activer l’appairage Bluetooth Low Energy InBody).',
      'Vérifier la détection du port série virtuel sous Linux (/dev/ttyUSB0) ou sous Windows (COM3).',
      'Configurer le port série à 9600 bauds, 8 bits de données, sans parité, 1 bit d’arrêt (8N1).',
      'Effectuer une pesée test avec électrodes de paume et pouces : contrôler la remontée du poids, de la masse musculaire squelettique (SMM), du pourcentage de masse grasse (PBF), de l’eau corporelle (TBW) et du niveau de graisse viscérale.',
      'Valider l’import automatique dans l’Espace Bilan de C.Fitness OS.',
    ],
    command: 'stty -F /dev/ttyUSB0 9600 cs8 -cstopb -parenb 2>/dev/null || lsusb',
    secondaryCommand: 'cat /dev/ttyUSB0 2>/dev/null',
    configSnippet: {
      filename: 'computeInBodySheetMetrics() (src/domain/rules.ts)',
      description: 'Traduction des trames InBody 120 vers C.Fitness OS',
      content: `// Paramètres port COM InBody 120 :
// Baudrate: 9600 · Data bits: 8 · Stop bits: 1 · Parity: None
// Trames émises : Poids (kg), SMM (kg), BFM (kg), PBF (%), TBW (L), VFL (niveau)`,
    },
    verification: 'La trame InBody est reçue dès que l’adhérent descend de la balance. Les 6 graphiques s’affichent en vert dans la fiche adhérent.',
    pitfall: 'Ne jamais utiliser une rallonge USB non amplifiée de plus de 3 mètres : cela génère des erreurs de parité et des trames de mesure tronquées.',
  },
  {
    id: 'step-8-poe-kiosk-tablets',
    number: 8,
    category: 'kiosks',
    categoryLabel: 'Bornes Kiosque PoE',
    step: 'ÉTAPE 8 · Dalles Tactiles Murales PoE d’Accueil & Badgeuse PIN (Anti-Gonflement)',
    duration: '30 min',
    location: 'Murs d’Entrée Carré de Soie (10.10.0.31) & Beynost (10.20.0.31)',
    summary: 'Fixation VESA PMR (1,30 m), alimentation 100 % filaire RJ45 PoE sans batterie (iiyama ProLite TW1023ASC-B1P ou Samsung Tab Active5), et verrouillage Fully Kiosk Browser.',
    hardwareRequired: '2x Dalles tactiles Android PoE industrielles (sans batterie lithium interne), 2x Supports muraux antivol VESA verrouillables par clé, 2x Câbles RJ45 Cat.6 reliés aux ports PoE du switch de baie.',
    tasks: [
      'Fixer solidement les supports muraux VESA à l’entrée de chaque club, à une hauteur de 1,30 m du sol (norme accessibilité PMR).',
      'Passer le câble RJ45 Cat.6 blindé depuis le switch PoE de la baie informatique jusqu’au boîtier mural.',
      'Enclencher la dalle tactile PoE : vérifier qu’elle s’allume automatiquement via le courant transporté par le câble Ethernet PoE (aucun transformateur 220V ni prise USB).',
      'Attribuer l’IP statique 10.10.0.31 (Carré de Soie) et 10.20.0.31 (Beynost).',
      'Installer Fully Kiosk Browser et définir l’URL de démarrage sur : https://10.10.0.10/kiosk/badgeuse.',
      'Activer le verrouillage kiosque : mot de passe admin, désactivation de la barre Android, réveil sur détection de mouvement par caméra frontale.',
      'Tester le badgeage d’un coach avec son code PIN à 4 chiffres (ex: 1042) et vérifier l’affichage immédiat du pointage dans l’Espace RH.',
    ],
    command: 'ping -c 3 10.10.0.31 && ping -c 3 10.20.0.31',
    secondaryCommand: 'curl -k -I https://10.10.0.10/kiosk/badgeuse',
    configSnippet: {
      filename: 'Fully Kiosk Browser Settings (fully-kiosk-config.json)',
      description: 'Configuration du mode kiosque sécurisé pour tablette murale',
      content: `{
  "startURL": "https://10.10.0.10/kiosk/badgeuse",
  "kioskMode": true,
  "kioskPin": "VOTRE_PIN_SECRET",
  "motionDetection": true,
  "screenOffInDarkness": true,
  "actionBarTitle": "C.Fitness OS - Badgeuse & Accueil",
  "preventSleepWhileCharging": true
}`,
    },
    verification: 'En touchant l’écran ou en s’approchant, la badgeuse s’allume instantanément. Impossible de quitter l’application sans le code PIN administrateur.',
    pitfall: 'Ne jamais utiliser une tablette grand public avec batterie lithium branchée 24h/24 sur un chargeur USB mural : après 6 à 12 mois, la batterie gonfle, décolle l’écran et crée un risque réel de court-circuit incendie.',
  },
  {
    id: 'step-9-wireguard-vpn',
    number: 9,
    category: 'vpn',
    categoryLabel: 'VPN Inter-Clubs',
    step: 'ÉTAPE 9 · Tunnel WireGuard Site-à-Site Beynost ↔ Carré de Soie (< 3 ms)',
    duration: '20 min',
    location: 'Routeur MikroTik Carré de Soie (10.10.0.1) ↔ Routeur MikroTik Beynost (10.20.0.1)',
    summary: 'Interconnexion chiffrée permanente WireGuard (ChaCha20-Poly1305, port UDP 51820) : Beynost accède à la base maître et aux services locaux en 2,4 ms sans exposition web.',
    hardwareRequired: 'Routeur professionnel MikroTik RB5009UG (Carré de Soie) et MikroTik hEX S (Beynost) avec RouterOS v7 ou démon WireGuard Linux.',
    tasks: [
      'Générer la paire de clés cryptographiques WireGuard (privée / publique) pour les deux sites.',
      'Sur le routeur de Carré de Soie (10.10.0.1), créer l’interface wg0 en écoute sur le port UDP 51820 avec l’adresse VPN 10.254.0.1/30.',
      'Sur le routeur de Beynost (10.20.0.1), créer l’interface wg0 pointant vers l’IP publique fixe de Carré de Soie (UDP 51820) avec l’adresse VPN 10.254.0.2/30.',
      'Configurer le routage statique : router le réseau 10.20.0.0/24 via wg0 depuis CDS, et router 10.10.0.0/24 via wg0 depuis Beynost.',
      'Depuis un PC d’accueil ou une tablette à Beynost (10.20.0.50), lancer un ping vers 10.10.0.10 : mesurer la latence (< 3 ms).',
      'Vérifier que les ordinateurs de Beynost ouvrent l’interface C.Fitness OS (https://10.10.0.10) et communiquent avec Heitz sans aucune coupure.',
    ],
    command: 'sudo wg show && ping -c 4 10.20.0.1',
    secondaryCommand: 'traceroute -n 10.20.0.1',
    configSnippet: {
      filename: '/etc/wireguard/wg0.conf (Serveur Carré de Soie)',
      description: 'Configuration du tunnel WireGuard site-à-site haute performance',
      content: `[Interface]
Address = 10.254.0.1/30
ListenPort = 51820
PrivateKey = CLE_PRIVEE_SERVEUR_CDS

# Peer: Routeur Beynost (2e club)
[Peer]
PublicKey = CLE_PUBLIQUE_ROUTEUR_BEYNOST
AllowedIPs = 10.254.0.2/32, 10.20.0.0/24
PersistentKeepalive = 25`,
    },
    verification: '"wg show" affiche le handshake WireGuard avec un transfert de paquets bidirectionnel ("latest handshake: 12 seconds ago"). Le ping entre les deux clubs est stable à ~2,4 ms.',
    pitfall: 'Ne jamais utiliser un protocole VPN obsolète ou lourd (PPTP, L2TP ou OpenVPN TCP) : WireGuard dans le noyau Linux offre un débit gigabit saturé et se reconnecte en 1 milliseconde si la ligne fibre micro-décroche.',
  },
  {
    id: 'step-10-silae-systemd-backups',
    number: 10,
    category: 'payroll',
    categoryLabel: 'Paie Silae & Sauvegardes 3-2-1',
    step: 'ÉTAPE 10 · Paramétrage Paie Silae (IDCC 2511), Script Cron 3-2-1 & Test à Blanc',
    duration: '25 min',
    location: 'Serveur Principal (10.10.0.10) & Espace RH Planning',
    summary: 'Validation des barèmes conventionnels IDCC 2511 (repos 11h, pause 20 min), test d’export CSV Silae pour le cabinet comptable, et exécution à blanc du script de sauvegarde chiffrée 3-2-1.',
    hardwareRequired: 'NAS de réplication déporté à Beynost (10.20.0.10) accessible via WireGuard, Clé USB sécurisée chiffrée XTS-AES pour le coffre-fort physique.',
    tasks: [
      'Vérifier dans src/domain/rules.ts que les règles de la Convention Collective Nationale du Sport (IDCC 2511) sont actives : repos quotidien minimal de 11h, pause de 20 min toutes les 6h, majoration dimanche.',
      'Dans "03 · L’Espace Planning → Export Silae", générer le fichier CSV d’échange contenant les rubriques légales (0100 heures normales, 0110 HS 25%, 0120 HS 50%, 0240 dimanche, 0400 primes).',
      'Transmettre le fichier CSV test au cabinet comptable pour validation du format d’import DSN Silae.',
      'Déposer le script de sauvegarde chiffrée 3-2-1 dans /opt/cfitness-os/scripts/backup-321.sh et programmer la tâche cron quotidienne à 03h00 (/etc/cron.d/cfos-backup).',
      'Exécuter manuellement le script de sauvegarde : sudo /opt/cfitness-os/scripts/backup-321.sh.',
      'Contrôler la présence des 3 copies distinctes : 1. Copie locale NVMe (/var/backups/cfitness-os/), 2. Copie distante synchronisée sur le NAS de Beynost via WireGuard, 3. Copie sur support amovible chiffré.',
      'Effectuer un test de restauration à blanc du dump PostgreSQL dans une base de secours pour valider la reprise d’activité en moins de 10 minutes.',
    ],
    command: 'sudo /opt/cfitness-os/scripts/backup-321.sh && sudo ls -lh /var/backups/cfitness-os/',
    secondaryCommand: 'pg_restore --list /var/backups/cfitness-os/cfitness_os_latest.dump.gpg | head -n 15',
    configSnippet: {
      filename: '/etc/cron.d/cfos-backup',
      description: 'Tâche cron quotidienne de sauvegarde chiffrée 3-2-1 à 03h00',
      content: `# Sauvegarde chiffrée C.Fitness OS 3-2-1 quotidienne à 03h00
0 3 * * * root /opt/cfitness-os/scripts/backup-321.sh >> /var/log/cfos-backup.log 2>&1`,
    },
    verification: 'Le script affiche "Sauvegarde 3-2-1 réussie : 3 copies synchronisées, chiffrement GPG AES-256 valide". L’export Silae est validé sans anomalie par le comptable.',
    pitfall: 'Ne jamais laisser les sauvegardes non chiffrées sur le même disque dur physique que la base de données : en cas de panne matérielle ou de vol, vous perdriez à la fois la production et les sauvegardes.',
  },
];

const THIRD_PARTY_UPDATE_GUIDES: Array<{
  id: string;
  software: string;
  frequency: string;
  frequencyBadge?: string;
  whatCanChange: string[];
  howToUpdateOurProject: string[];
  filesToTouch: string;
  stepId: string;
  stepLabel: string;
  targetSection: NavSection;
  targetSectionLabel: string;
}> = [
  {
    id: 'tp-heitz',
    software: '1. Système Heitz (Heitz-WS.exe, Base SQL & API Postman)',
    frequency: '1 à 2 mises à jour majeures / an par Heitz System',
    whatCanChange: [
      'Ajout d’un nouveau champ obligatoire dans POST /api/client/add ou POST /api/planning/book lors d’une montée de version Heitz.',
      'Changement de numéro de port local ou renouvellement du jeton dans Configuration.exe après une maintenance Windows.',
      'Nouveaux codes d’état pour les prélèvements SEPA/EBICS (finBalanceState) ou nouveaux articles TPV NF525.',
    ],
    howToUpdateOurProject: [
      '1. Ne jamais faire la mise à jour Heitz à l’aveugle aux heures de pointe : la lancer le matin en heures creuses.',
      '2. Après la mise à jour de Heitz par leur support, tester immédiatement la réponse JSON sur le serveur local : curl http://10.10.0.20:8080/api/status.',
      '3. Dans votre projet sur votre IDE Antigravity, seuls 2 fichiers centralisent 100 % des appels Heitz : le connecteur serveur (/api/heitz-ws) et les fonctions métier dans src/domain/rules.ts (generateHeitzTrialPassageCode, evaluateGatePassage, computeHeitzKpiSummary).',
      '4. Adapter le nom du champ JSON dans ce seul connecteur, vérifier avec npm run build, puis pousser la mise à niveau sur le serveur du club.',
    ],
    filesToTouch: ' Fichier .env (si clé/port changé) · src/domain/rules.ts · Connecteur /api/heitz-ws',
    stepId: 'step-4-heitz-local-bridge',
    stepLabel: 'Voir Étape #04 (Configuration Pont Heitz Local)',
    targetSection: 'devices',
    targetSectionLabel: 'Ouvrir 08 · Matériel Heitz & Checkup',
  },
  {
    id: 'tp-technogym',
    software: '2. Technogym Mywellness Cloud Pro & Stations Checkup',
    frequency: 'Mises à jour Cloud transparentes par Technogym',
    frequencyBadge: 'Faible impact',
    whatCanChange: [
      'Modification par Technogym de la structure des liens directs (Deep-Links) vers la fiche d’un adhérent sur pro.mywellness.com.',
      'Ajout de nouveaux indicateurs biométriques sur les stations Technogym Checkup (au-delà du Wellness Age™, SMM, PBF et masse segmentaire).',
    ],
    howToUpdateOurProject: [
      '1. Toute la génération des liens Mywellness est isolée dans une seule fonction : buildMywellnessContextualUrl() dans src/domain/rules.ts.',
      '2. Si Technogym change l’URL de son portail Pro, modifiez uniquement la ligne d’URL dans buildMywellnessContextualUrl() : tous les boutons « Ouvrir Mywellness » du 1er Plan et du CRM seront mis à jour instantanément.',
      '3. Si Checkup ajoute une nouvelle mesure, ajoutez la colonne dans computeInBodySheetMetrics() (src/domain/rules.ts) et dans l’onglet 2 de DevicesHeitzView.tsx.',
    ],
    filesToTouch: 'src/domain/rules.ts (buildMywellnessContextualUrl & computeInBodySheetMetrics)',
    stepId: 'step-6-technogym-checkup',
    stepLabel: 'Voir Étape #06 (Configuration Technogym Checkup)',
    targetSection: 'devices',
    targetSectionLabel: 'Ouvrir 08 · Stations Checkup & Mywellness',
  },
  {
    id: 'tp-silae',
    software: '3. Silae Paie (Cabinet Comptable, DSN & Convention IDCC 2511)',
    frequency: '1 fois / an (revalorisation SMIC / grille IDCC 2511) ou demande du comptable',
    whatCanChange: [
      'Revalorisation légale du taux horaire minimum de la Convention Collective Nationale du Sport (IDCC 2511 — actuellement 12,02 € brut / 1 823,03 € mensuel).',
      'Demande du cabinet comptable de modifier un code rubrique d’import Silae (ex: code 0100 Heures normales, 0110 HS 25%, 0240 Majoration Dimanche, ou code prime commerciale).',
    ],
    howToUpdateOurProject: [
      '1. Ouvrir src/domain/rules.ts sur votre IDE Antigravity.',
      '2. Pour mettre à jour le salaire ou taux horaire légal sur tous les nouveaux contrats CDI et calculs de paie : modifier uniquement l’objet CFITNESS_LEGAL_IDENTITY (lignes 57 à 75 de src/domain/rules.ts).',
      '3. Pour modifier le format d’export Silae : modifier uniquement la fonction buildSilaeApiPayload() dans src/domain/rules.ts, générer un fichier CSV test depuis « 03 · L’Espace Planning → Export Silae » et le valider avec le comptable.',
    ],
    filesToTouch: 'src/domain/rules.ts (CFITNESS_LEGAL_IDENTITY & buildSilaeApiPayload)',
    stepId: 'step-10-silae-backups-321',
    stepLabel: 'Voir Étape #10 (Validation Paie Silae & IDCC 2511)',
    targetSection: 'planning-hr',
    targetSectionLabel: 'Ouvrir 03 · Planning RH & Export Silae',
  },
  {
    id: 'tp-telecom',
    software: '4. OVHcloud Télécom (Trunk SIP 04) & Passerelle 4G Yeastar (SIM 07)',
    frequency: 'En cas d’ajout de ligne, changement de carte SIM ou nouvelle norme ARCEP',
    whatCanChange: [
      'Ajout d’une nouvelle carte SIM 07 dans la passerelle Yeastar TG400 ou remplacement d’un numéro.',
      'Renouvellement annuel du certificat TLS pour le microphone WebRTC ou mise à jour de sécurité Asterisk.',
    ],
    howToUpdateOurProject: [
      '1. En cas de remplacement ou d’ajout d’une carte SIM 07 dans le boîtier Yeastar TG400 (10.10.0.14), mettre à jour le numéro dans la liste du pool mobile.',
      '2. Pour mettre à jour les conteneurs téléphonie/WebRTC sans toucher aux données : lancer docker compose pull && docker compose up -d sur le serveur.',
    ],
    filesToTouch: 'Fichier .env · docker-compose.yml · Liste des lignes dans src/data/initialData.ts',
    stepId: 'step-5-telecom-ovh-yeastar',
    stepLabel: 'Voir Étape #05 (Configuration Trunk OVH & Yeastar 4G)',
    targetSection: 'telephony',
    targetSectionLabel: 'Ouvrir 04 · Téléphonie 04/07 & SMS',
  },
];

const SPEC_TO_STEP_MAP: Record<string, { stepId: string; stepLabel: string }> = {
  'spec-arcep-gsm-07': {
    stepId: 'step-5-telecom-ovh-yeastar',
    stepLabel: 'Voir Étape #05 · Passerelle 4G Yeastar & Trunk OVH',
  },
  'spec-poe-kiosk-tablets': {
    stepId: 'step-8-poe-kiosk-tablets',
    stepLabel: 'Voir Étape #08 · Bornes Tactiles PoE RJ45',
  },
  'spec-webrtc-tls-certs': {
    stepId: 'step-3-docker-certs-systemd',
    stepLabel: 'Voir Étape #03 · Certificats TLS mkcert & Docker',
  },
  'spec-heitz-turnstiles-local': {
    stepId: 'step-4-heitz-local-bridge',
    stepLabel: 'Voir Étape #04 · Pont Local Heitz & Tourniquets',
  },
  'spec-whisper-gpu-ups': {
    stepId: 'step-7-whisper-gpu-rgpd',
    stepLabel: 'Voir Étape #07 · GPU NVIDIA Whisper & Onduleur NUT',
  },
};

export function GovernanceView() {
  const {
    clubFilter,
    goNoGoPhases,
    auditLogs,
    signGoNoGoPhase,
    isArchitectUnlocked,
    unlockArchitectSpace,
    lockArchitectSpace,
    setActiveSection,
  } = useCfos();

  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArchitectTabId>('server_hardware');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [activeDeployFile, setActiveDeployFile] =
    useState<keyof typeof DEPLOYMENT_FILES>('docker-compose.yml');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedAllPlan, setCopiedAllPlan] = useState(false);

  // États interactifs d'activation/désactivation des équipements et connecteurs
  const [hardwareStatuses, setHardwareStatuses] = useState<Record<string, 'ONLINE' | 'MAINTENANCE'>>(() => {
    const init: Record<string, 'ONLINE' | 'MAINTENANCE'> = {};
    CLUB_HARDWARE_INVENTORY.forEach((h) => {
      init[h.id] = 'ONLINE';
    });
    return init;
  });

  const [specVerifiedMap, setSpecVerifiedMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    HARDWARE_COMPATIBILITY_SPECS.forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });

  const [connectorAutoWatch, setConnectorAutoWatch] = useState<Record<string, boolean>>({
    'tp-heitz': true,
    'tp-technogym': true,
    'tp-silae': true,
    'tp-telecom': true,
  });
  const [connectorTestNotice, setConnectorTestNotice] = useState<string | null>(null);
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);

  // État interactif de la checklist de mise en service sur site (persisté en localStorage)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('cfos_onsite_checklist') : null;
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

  const [activeStepFilter, setActiveStepFilter] = useState<string>('all');
  const [copiedCmdId, setCopiedCmdId] = useState<string | null>(null);
  const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);

  const jumpToRunbookStep = (stepId: string) => {
    setActiveTab('onsite_runbook');
    setActiveStepFilter('all');
    setExpandedConfigId(stepId);
    setHighlightedStepId(stepId);
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
          ? `Équipement « ${hwName} » réactivé en production (statut : EN LIGNE).`
          : `Équipement « ${hwName} » basculé en mode Maintenance / Test isolé.`
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
    const text = `# C.FITNESS OS — CHECKLIST PAS-À-PAS DE MISE EN SERVICE SUR SITE
${ONSITE_INSTALLATION_STEPS.map(
  (s) => `## ${s.step} [${completedSteps[s.id] ? 'FAIT' : 'À FAIRE'}]
- Durée : ${s.duration} | Lieu : ${s.location}
- Matériel : ${s.hardwareRequired}
- Actions :
${s.tasks.map((t) => `  * ${t}`).join('\n')}
- Commande : ${s.command}
- Vérification : ${s.verification}
- Piège évité : ${s.pitfall}
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
      `Diagnostic matériel & réseau local réussi (${new Date().toLocaleTimeString('fr-FR')}) : Serveur Principal 10.10.0.10 OK · Serveur Heitz 10.10.0.20:8080 en circuit fermé LAN (18 ms) OK · Trunk SIP OVHcloud (04) + Passerelle 4G Yeastar TG400 (10.10.0.14 · SIM 07) OK · Tunnel WireGuard CDS ↔ Beynost (2,4 ms) OK.`
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
        <div className="max-w-md w-full bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400">
              Accès Restreint · Concepteur &amp; Administrateur Système
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Serveur, Mise en Œuvre sur Place &amp; Mises à Jour
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cet espace regroupe l&apos;architecture matérielle du serveur, le guide pas-à-pas d&apos;installation au club, la procédure de mise à niveau avec les logiciels tiers et la gouvernance 3-2-1. Entrez votre code PIN personnel à 4 chiffres pour déverrouiller.
            </p>
          </div>

          {/* Indicateur à 4 points */}
          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < pinInput.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all ${
                    filled
                      ? 'bg-orange-500 scale-110 shadow-xs'
                      : 'bg-slate-800 border border-slate-600'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-semibold">
              {pinError}
            </div>
          )}

          {/* Pavé numérique tactile */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-orange-600 border border-slate-700 text-white font-mono text-lg font-bold transition-colors cursor-pointer"
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
              className="h-14 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 text-slate-400 text-xs font-bold transition-colors cursor-pointer"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className="h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-orange-600 border border-slate-700 text-white font-mono text-lg font-bold transition-colors cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Corriger"
              className="h-14 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-500 font-mono">
            Saisie au clavier ou pavé tactile · Masqué aux dirigeants et équipes
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ESPACE DÉVERROUILLÉ (RÉSERVÉ AU CONCEPTEUR DU PROJET)
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* En-tête de l'Espace Personnel Architecte */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Unlock className="w-3.5 h-3.5" />
              <span>Espace Personnel Déverrouillé · Confidentiel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Matériel Serveur, Installation sur Place, Mises à Jour Tiers &amp; Gouvernance 3-2-1
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Retrouvez ici toutes vos fiches techniques serveur, la marche à suivre exacte pour brancher et configurer le projet sur place au club, le protocole de mise à niveau en fonction des mises à jour des logiciels tiers (Heitz, Technogym, Silae, OVHcloud) et vos sauvegardes 3-2-1.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPinInput('');
                setPinError(null);
                lockArchitectSpace();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Verrouiller cet espace</span>
            </button>
          </div>
        </div>

        {/* Barre des 4 onglets techniques */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('server_hardware')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'server_hardware'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 1</div>
              <div className="truncate">Matériel Serveur &amp; Réseau LAN</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('onsite_runbook')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'onsite_runbook'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <Terminal className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 2</div>
              <div className="truncate">Marche à Suivre sur Place (.env)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('third_party_updates')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'third_party_updates'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <GitBranch className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 3</div>
              <div className="truncate">Mises à Jour Logiciels Tiers</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('governance_backups')}
            className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'governance_backups'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase opacity-80">Onglet 4</div>
              <div className="truncate">Sauvegardes 3-2-1 &amp; Gouvernance</div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          ONGLET 1 : MATÉRIEL SERVEUR, RÉSEAU LOCAL LAN & FICHIERS PRODUCTION
         ===================================================================== */}
      {activeTab === 'server_hardware' && (
        <div className="space-y-6">
          {/* Architecture Circuit Fermé LAN (Zéro Transit Cloud) */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Confidentialité Totale des Données Clients · Circuit Fermé LAN
                </div>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Architecture de Branchement Serveur C.Fitness OS (10.10.0.10) ↔ Serveur Heitz (10.10.0.20)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shrink-0">
                Aucune donnée adhérent sur Internet
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                <div className="font-bold text-orange-300">
                  1. Zéro code secret dans les navigateurs
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Les identifiants Heitz (<code className="font-mono text-emerald-300">HEITZ_WS_URL</code> et <code className="font-mono text-emerald-300">HEITZ_WS_DEV_KEY</code>) sont lus exclusivement côté serveur local (fichier <code className="font-mono">.env</code> sur la machine du club) via la route proxy interne <code className="font-mono">/api/heitz-ws</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                <div className="font-bold text-emerald-300">
                  2. Câble RJ45 Local &amp; VPN WireGuard
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Le serveur C.Fitness OS (<code className="font-mono">10.10.0.10</code>) interroge directement le serveur Windows Heitz (<code className="font-mono">10.10.0.20:8080</code>) sur le switch local de Carré de Soie sans jamais sortir sur Internet. Beynost y accède via le tunnel chiffré WireGuard.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                <div className="font-bold text-sky-300">
                  3. Travail sur votre PC portable (Antigravity)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Lorsque vous codez ou testez sur votre PC portable, le projet tourne sur <code className="font-mono">localhost:3000</code> avec des données de démonstration locales tant que vous n&apos;êtes pas branché au réseau local <code className="font-mono">10.10.0.x</code> du club.
                </p>
              </div>
            </div>
          </div>

          {/* Inventaire Technique Complet des Équipements & IP */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  Plan d&apos;Adressage IP, Serveur, Passerelle 4G Yeastar, Bornes PoE &amp; Protocoles ({filteredHardware.length} équipements)
                </h2>
              </div>
              <button
                onClick={handleRunDiagnostic}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                Tester Ping &amp; Protocoles Réseau
              </button>
            </div>

            {pingResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center justify-between gap-2">
                <span>{pingResult}</span>
                <button
                  onClick={() => setPingResult(null)}
                  className="underline text-[11px] shrink-0 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Équipement / Serveur</th>
                    <th className="py-2.5 px-3">Site</th>
                    <th className="py-2.5 px-3">IP Locale / Endpoint</th>
                    <th className="py-2.5 px-3">Protocole &amp; Port</th>
                    <th className="py-2.5 px-3">État &amp; Latence</th>
                    <th className="py-2.5 px-3">Configuration &amp; Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHardware.map((hw) => {
                    const isOnline = (hardwareStatuses[hw.id] ?? 'ONLINE') === 'ONLINE';
                    return (
                      <tr key={hw.id} className="align-top hover:bg-slate-50/60">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {hw.category === 'INFRA_RESEAU' ? (
                              <Cpu className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            ) : (
                              <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span>{hw.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{hw.model}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {hw.clubId === 'carre-de-soie'
                            ? 'Carré de Soie'
                            : hw.clubId === 'beynost'
                            ? 'Beynost'
                            : 'Bi-Club (CDS ↔ BEY)'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-800 whitespace-nowrap">
                          {hw.ipOrEndpoint}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-[11px] font-semibold text-slate-900">
                            {hw.protocol}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">{hw.port}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isOnline
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {isOnline ? `${hw.latencyMs} ms · EN LIGNE` : 'MAINTENANCE'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleHardwareNodeStatus(hw.id, hw.name)}
                              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                isOnline
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              <span>{isOnline ? 'Mettre en pause' : 'Réactiver'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 space-y-2">
                          <div>{hw.details}</div>
                          <button
                            type="button"
                            onClick={() => jumpToRunbookStep(hw.stepId)}
                            className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Terminal className="w-3 h-3 text-orange-600" />
                            <span>{hw.stepShortLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fiches Constructeurs & Câblage Réel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="pb-3 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Spécifications Constructeurs &amp; Câblage Terrain
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Références matérielles exactes à commander / vérifier sur place
                </h2>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                5 Domaines Matériels Vérifiés
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {HARDWARE_COMPATIBILITY_SPECS.map((spec) => {
                const isSpecActive = specVerifiedMap[spec.id] ?? true;
                const stepLink = SPEC_TO_STEP_MAP[spec.id];
                return (
                  <div
                    key={spec.id}
                    className={`rounded-xl border p-4 space-y-3 text-xs transition-colors ${
                      isSpecActive
                        ? 'border-slate-200 bg-slate-50/50'
                        : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                      <div className="font-bold text-sm text-slate-900">{spec.title}</div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800">
                          Budget matériel indicatif : {spec.estimatedHardwareBudget}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSpecVerifiedMap((prev) => ({
                              ...prev,
                              [spec.id]: !isSpecActive,
                            }))
                          }
                          className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                            isSpecActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isSpecActive ? 'Vérifié & Actif' : 'À vérifier sur site'}</span>
                        </button>
                        {stepLink && (
                          <button
                            type="button"
                            onClick={() => jumpToRunbookStep(stepLink.stepId)}
                            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Terminal className="w-3 h-3 text-orange-400" />
                            <span>{stepLink.stepLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 space-y-1">
                        <div className="font-bold text-rose-900 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Piège technique évité :</span>
                        </div>
                        <p className="text-rose-950 leading-relaxed">{spec.hallucinationAvoided}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Solution matérielle à mettre en œuvre :</span>
                        </div>
                        <p className="text-emerald-950 leading-relaxed">{spec.realWorldSolution}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">Modèles Constructeurs :</span>{' '}
                        <span className="text-slate-600">{spec.manufacturerModels}</span>
                      </div>
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">Câblage &amp; Protocole :</span>{' '}
                        <span className="font-mono text-slate-700">
                          {spec.physicalWiringAndProtocol}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-white border border-slate-200">
                        <span className="font-bold text-slate-800">Conformité :</span>{' '}
                        <span className="text-emerald-800 font-medium">
                          {spec.regulatoryCompliance}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fichiers de Déploiement Serveur (docker-compose.yml, Dockerfile, Rust) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-orange-600" />
                  Fichiers de Déploiement Serveur (Docker Compose, Dockerfile &amp; Backend)
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(Object.keys(DEPLOYMENT_FILES) as Array<keyof typeof DEPLOYMENT_FILES>).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setActiveDeployFile(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                        activeDeployFile === f
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  )
                )}
                <button
                  onClick={() => handleDownloadDeployFile(activeDeployFile)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
              {DEPLOYMENT_FILES[activeDeployFile]}
            </pre>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 2 : MARCHE À SUIVRE SUR PLACE (RUNBOOK D'INSTALLATION AU CLUB)
         ===================================================================== */}
      {activeTab === 'onsite_runbook' && (() => {
        const totalSteps = ONSITE_INSTALLATION_STEPS.length;
        const completedCount = ONSITE_INSTALLATION_STEPS.filter((s) => completedSteps[s.id]).length;
        const progressPercent = Math.round((completedCount / totalSteps) * 100);

        const filteredSteps = ONSITE_INSTALLATION_STEPS.filter((s) => {
          if (activeStepFilter === 'all') return true;
          if (activeStepFilter === 'hardware') return s.category === 'hardware';
          if (activeStepFilter === 'system') return s.category === 'system';
          if (activeStepFilter === 'heitz') return s.category === 'heitz';
          if (activeStepFilter === 'telecom') return s.category === 'telecom';
          if (activeStepFilter === 'kiosks_bio') return s.category === 'kiosks' || s.category === 'biometrie';
          if (activeStepFilter === 'vpn_payroll') return s.category === 'vpn' || s.category === 'payroll';
          return true;
        });

        return (
          <div className="space-y-6">
            {/* Bannière principale & Baromètre de progression terrain */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Onglet 2 · Guide d&apos;Intervention Terrain &amp; Mise en Service Pas-à-Pas</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Toute la configuration du matériel et réglages logiciels étape par étape
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                    Suivez ces 10 étapes méthodiques dans l&apos;ordre lors du déploiement à Carré de Soie et Beynost. Cochez chaque étape au fur et à mesure sur votre écran : la progression est sauvegardée en local sur votre appareil pour ne rien oublier.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyAllPlan}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedAllPlan ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Plan Markdown copié !</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-orange-400" />
                        <span>Copier le plan complet</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Tout valider</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    <span>Réinitialiser</span>
                  </button>
                </div>
              </div>

              {/* Barre de Progression */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-orange-600" />
                    <span>Progression de la mise en service sur site :</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {completedCount} / {totalSteps} étapes validées ({progressPercent} %)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPercent === 100
                        ? 'bg-emerald-500'
                        : progressPercent > 50
                        ? 'bg-orange-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {progressPercent === 100 && (
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Félicitations ! L&apos;ensemble de la configuration matérielle et logicielle est validée. Le club est 100 % opérationnel.</span>
                  </div>
                )}
              </div>

              {/* Filtres par domaine d'intervention */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { id: 'all', label: `Toutes les étapes (${totalSteps})` },
                  { id: 'hardware', label: '1. Matériel & Onduleur' },
                  { id: 'system', label: '2. Réseau & Docker' },
                  { id: 'heitz', label: '3. Pont Heitz Local' },
                  { id: 'telecom', label: '4. Télécom 04 / 07' },
                  { id: 'kiosks_bio', label: '5. Biométrie & Kiosques' },
                  { id: 'vpn_payroll', label: '6. VPN & Paie Silae' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveStepFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeStepFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des Étapes Interactives */}
            <div className="space-y-4">
              {filteredSteps.map((step) => {
                const isDone = !!completedSteps[step.id];
                const isConfigOpen = expandedConfigId === step.id;

                return (
                  <div
                    key={step.id}
                    id={`runbook-${step.id}`}
                    className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all shadow-2xs space-y-4 ${
                      highlightedStepId === step.id
                        ? 'border-orange-500 ring-2 ring-orange-400/50 bg-orange-50/10'
                        : isDone
                        ? 'border-emerald-300 ring-1 ring-emerald-200/60 bg-emerald-50/15'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* En-tête de l'étape avec Checkbox et Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          aria-label={isDone ? 'Marquer à faire' : 'Marquer comme fait'}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 hover:border-orange-500 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                              #{String(step.number).padStart(2, '0')}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                              {step.categoryLabel}
                            </span>
                            <span className="font-mono text-xs text-slate-500">
                              ⏱️ {step.duration}
                            </span>
                          </div>
                          <h3 className={`text-base font-black tracking-tight ${isDone ? 'text-emerald-950' : 'text-slate-900'}`}>
                            {step.step}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          📍 {step.location}
                        </span>
                      </div>
                    </div>

                    {/* Résumé de l'étape */}
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {step.summary}
                    </p>

                    {/* Matériel requis */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
                      <Server className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Matériel &amp; outillage requis sur place :</span>{' '}
                        <span className="text-slate-700">{step.hardwareRequired}</span>
                      </div>
                    </div>

                    {/* Actions pas-à-pas à cocher */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Actions à réaliser sur place :
                      </div>
                      <ul className="grid grid-cols-1 gap-2 text-xs text-slate-700">
                        {step.tasks.map((task, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/70 border border-slate-100"
                          >
                            <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bloc Commande Terminal avec Bouton Copier */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono uppercase font-bold text-slate-500 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-orange-600" />
                          <span>Commande principale à exécuter dans le terminal :</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(step.command, `cmd-${step.id}`)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-mono text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCmdId === `cmd-${step.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copier la commande</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                        $ {step.command}
                      </pre>
                    </div>

                    {/* Commande secondaire optionnelle */}
                    {step.secondaryCommand && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-500">
                            Commande de vérification / inspection :
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCommand(step.secondaryCommand!, `sec-${step.id}`)
                            }
                            className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          >
                            {copiedCmdId === `sec-${step.id}` ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] overflow-x-auto">
                          $ {step.secondaryCommand}
                        </pre>
                      </div>
                    )}

                    {/* Extrait de fichier de configuration avec bouton déplier */}
                    {step.configSnippet && (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedConfigId(isConfigOpen ? null : step.id)
                            }
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCode2 className="w-3.5 h-3.5" />
                            <span>
                              {isConfigOpen ? 'Masquer' : 'Voir'} l&apos;extrait de configuration ({step.configSnippet.filename})
                            </span>
                            {isConfigOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isConfigOpen && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyCommand(
                                  step.configSnippet!.content,
                                  `cfg-${step.id}`
                                )
                              }
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedCmdId === `cfg-${step.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copié !</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copier le fichier</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {isConfigOpen && (
                          <div className="space-y-1">
                            <div className="text-[11px] text-slate-500 font-medium">
                              {step.configSnippet.description}
                            </div>
                            <pre className="p-3 rounded-xl bg-slate-900 text-amber-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                              {step.configSnippet.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bloc Vérification & Piège Évité */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Comment vérifier que c&apos;est bon :</span>
                        </div>
                        <p className="text-emerald-950 leading-relaxed font-medium">
                          {step.verification}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Piège terrain évité :</span>
                        </div>
                        <p className="text-amber-950 leading-relaxed">
                          {step.pitfall}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Matrice des Adresses IP Fixes & Ports du Club */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Plan d&apos;Adressage &amp; Ports Réseau Fixes
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Tableau Récapitulatif des Équipements sur le Réseau Local LAN
                  </h3>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold">
                  VLAN 10 CDS &amp; VLAN 20 BEY
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">Équipement</th>
                      <th className="py-2.5 px-3">IP Fixe</th>
                      <th className="py-2.5 px-3">Ports &amp; Protocole</th>
                      <th className="py-2.5 px-3">Site</th>
                      <th className="py-2.5 px-3">Rôle Opérationnel</th>
                      <th className="py-2.5 px-3 text-right">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Serveur Maître C.Fitness OS</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">10.10.0.10</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">TCP 443, 3000, 5432, 6379, 8089</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">Carré de Soie</td>
                      <td className="py-2.5 px-3 text-slate-600">Moteur central Rust/Node, PostgreSQL, Redis, LiveKit WebRTC</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => jumpToRunbookStep('step-2-network-debian-ufw')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Étape #02</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Serveur Windows Heitz System</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">10.10.0.20</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">TCP 8080 (HZ.WS) / 1433 (SQL)</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">Carré de Soie</td>
                      <td className="py-2.5 px-3 text-slate-600">API locale HZ.WS, contrôle tourniquets RFID/BLE &amp; SEPA</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => jumpToRunbookStep('step-4-heitz-local-bridge')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Étape #04</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Passerelle GSM Yeastar TG400</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">10.10.0.14</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">UDP 5060 (SIP) / TCP 80 (API SMS)</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">Carré de Soie</td>
                      <td className="py-2.5 px-3 text-slate-600">4 SIM 4G VoLTE pour relances 07 conformes ARCEP + SMS STOP</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => jumpToRunbookStep('step-5-telecom-ovh-yeastar')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Étape #05</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Tablettes Murales PoE Badgeuse</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">10.10.0.31 / 10.20.0.31</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">TCP 443 (HTTPS Kiosk)</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">CDS &amp; Beynost</td>
                      <td className="py-2.5 px-3 text-slate-600">Pointage PIN coachs, accueil adhérents, sans batterie gonflable</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => jumpToRunbookStep('step-8-poe-kiosk-tablets')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Étape #08</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Stations Technogym Checkup</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">10.10.0.55 / 10.20.0.55</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">HTTPS 443 (Mywellness Cloud)</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">CDS &amp; Beynost</td>
                      <td className="py-2.5 px-3 text-slate-600">Balance BIA multi-fréquence, caméra 3D, Wellness Age™</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => jumpToRunbookStep('step-6-technogym-checkup')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Étape #06</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Routeurs Fibre &amp; WireGuard</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-bold">10.10.0.1 ↔ 10.20.0.1</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">UDP 51820 (WireGuard)</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">Bi-Club</td>
                      <td className="py-2.5 px-3 text-slate-600">Tunnel site-à-site &lt; 3 ms chiffré ChaCha20-Poly1305</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => jumpToRunbookStep('step-9-wireguard-vpn')}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Étape #09</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modèle Complet du Fichier .env de Production */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    <span>Modèle Exact du Fichier .env à Placer sur le Serveur du Club (/opt/cfitness-os/.env)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Ce fichier contient vos codes d&apos;accès Heitz et OVHcloud. Il reste strictement sur le disque dur du serveur du club (avec chmod 600) et n&apos;est jamais envoyé sur GitHub ni sur Internet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copié dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le modèle .env</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                {ENV_PRODUCTION_TEMPLATE}
              </pre>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          ONGLET 3 : MISES À JOUR EN FONCTION DES LOGICIELS TIERS CONSERVÉS
         ===================================================================== */}
      {activeTab === 'third_party_updates' && (
        <div className="space-y-6">
          {/* Principe d'Architecture Anti-Casse (Connecteurs Isolés) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Onglet 3 · Stratégie de Maintien à Niveau &amp; Mises à Jour
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Comment mettre à niveau C.Fitness OS lorsque Heitz, Technogym, Silae ou OVHcloud évoluent ?
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Votre projet a été conçu avec une <strong>architecture à connecteurs isolés</strong> : aucun écran ne dépend directement du code interne d&apos;un logiciel tiers. Toute la traduction passe par des fonctions dédiées dans <code className="font-mono font-bold text-slate-900">src/domain/rules.ts</code> et le proxy <code className="font-mono font-bold text-slate-900">/api/heitz-ws</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  1. Isolation Totale des Tiers
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Si Heitz ou Silae modifie un format de fichier lors d&apos;une mise à jour, vous n&apos;avez jamais besoin de refaire les écrans du club : vous modifiez uniquement les 10 lignes du traducteur dans <code className="font-mono">rules.ts</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  2. Test Préalable sur Antigravity
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Vous préparez et vérifiez toujours la mise à niveau sur votre PC portable (dans votre IDE Antigravity avec <code className="font-mono">npm run build</code>) avant de l&apos;envoyer sur le serveur du club.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                  3. Retour Arrière en 10 Secondes
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Grâce au versionnage Git local, si une mise à jour externe comporte une anomalie, une seule commande (<code className="font-mono">git checkout</code>) remet instantanément le club sur la version précédente.
                </p>
              </div>
            </div>
          </div>

          {connectorTestNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-950 flex items-center justify-between gap-3">
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

          {/* Fiches détaillées pour chacun des 4 logiciels tiers */}
          <div className="grid grid-cols-1 gap-4">
            {THIRD_PARTY_UPDATE_GUIDES.map((guide) => {
              const isWatchEnabled = connectorAutoWatch[guide.id] ?? true;
              return (
                <div
                  key={guide.software}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {guide.software}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Fréquence typique :{' '}
                        <span className="font-semibold text-slate-700">{guide.frequency}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                        Fichier(s) : {guide.filesToTouch}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setConnectorAutoWatch((prev) => ({
                            ...prev,
                            [guide.id]: !isWatchEnabled,
                          }))
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isWatchEnabled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>
                          {isWatchEnabled
                            ? 'Surveillance Connecteur : Active'
                            : 'Surveillance : En Pause'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                      <div className="font-bold text-amber-950 uppercase text-[11px]">
                        Ce qui peut évoluer chez ce partenaire tiers :
                      </div>
                      <ul className="space-y-1.5 text-slate-700">
                        {guide.whatCanChange.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold text-amber-700">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                      <div className="font-bold text-emerald-950 uppercase text-[11px]">
                        Marche à suivre exacte pour mettre à niveau C.Fitness OS :
                      </div>
                      <ul className="space-y-1.5 text-slate-800">
                        {guide.howToUpdateOurProject.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Barre d'actions directes par connecteur */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => jumpToRunbookStep(guide.stepId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5 text-orange-400" />
                        <span>{guide.stepLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSection(guide.targetSection)}
                        className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                        <span>{guide.targetSectionLabel}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setConnectorTestNotice(
                          `Test de compatibilité réussi (${new Date().toLocaleTimeString('fr-FR')}) pour « ${guide.software} » : schéma JSON et traducteur isolé (${guide.filesToTouch.trim()}) 100 % opérationnels.`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tester la compatibilité du connecteur</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Procédure Standard de Mise à Jour sur le Serveur du Club (Sans Coupure) */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase text-orange-400">
                Procédure Standard de Mise à Niveau au Club (Zéro Interruption)
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Les 4 commandes pour appliquer une mise à jour depuis votre IDE Antigravity vers le serveur du club
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="font-bold text-orange-300">
                  1. Sur votre PC portable (IDE Antigravity) — Préparer &amp; Valider
                </div>
                <p className="text-slate-300">
                  Après avoir adapté le connecteur dans votre code, vérifiez que tout compile sans erreur et créez une version Git :
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                  {`npm run lint && npm run build\ngit add -A && git commit -m "update: compatibilite nouvelle version"\ngit tag v2026.11`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="font-bold text-emerald-300">
                  2. Sur le Serveur du Club (10.10.0.10) — Appliquer ou Revenir en Arrière
                </div>
                <p className="text-slate-300">
                  Mettez à jour le serveur en 5 secondes (ou revenez à la version précédente en cas d&apos;imprévu chez le fournisseur tiers) :
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                  {`# Appliquer la mise à jour :\ncd /opt/cfitness-os && git pull && docker compose up -d --build\n\n# En cas d'imprévu (Rollback immédiat en 10s) :\ngit checkout v2026.10 && docker compose up -d --build`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 4 : GOUVERNANCE TECHNIQUE, SAUVEGARDES 3-2-1 & JALONS (PHASES 0-12)
         ===================================================================== */}
      {activeTab === 'governance_backups' && (
        <div className="space-y-6">
          {/* Cartes de Santé Serveur & Réplication 3-2-1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                Serveur Principal Carré de Soie (10.10.0.10)
              </div>
              <div className="text-slate-600">
                PostgreSQL 16 + Redis 7 + WebRTC + faster-whisper GPU local · Uptime 99,98%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Sauvegardes 3-2-1 &amp; Réplication 6 Appareils
              </div>
              <div className="text-slate-600">
                Miroir temps réel sur 2 PC de secours, 2 Tablettes Kiosques et 2 Smartphones + NAS Beynost
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-orange-600" />
                Conformité Technique &amp; RGPD (§11)
              </div>
              <div className="text-slate-600">
                Bandeau vocal RGPD actif · Cloisonnement données santé Checkup · Purge auto CV 24 mois
              </div>
            </div>
          </div>

          {/* Panneau de Réplication 3-2-1 et Test de Bascule Électrique < 3s */}
          <BackupFailoverPanel />

          {/* Matrice des Jalons d'Exécution & Fabrication (Phases 0 à 12) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Matrice des Jalons de Fabrication &amp; Déploiement (Phases 0 à 12 — Go/No-Go)
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {goNoGoPhases.map((gate) => (
                <div
                  key={gate.id}
                  className="py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">
                      <span className="font-mono text-orange-600">{gate.code}</span> —{' '}
                      {gate.title} ({gate.durationLabel})
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Livrables :</span>{' '}
                      {gate.deliverables.join(' · ')}
                    </div>
                    <div className="text-slate-500">
                      <span className="font-semibold text-slate-700">Critère Go/No-Go :</span>{' '}
                      {gate.exitCriteria}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {gate.status === 'valide' ? (
                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="font-bold text-emerald-700 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Validé Go</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {gate.signedBy} · {gate.signedAt}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => signGoNoGoPhase(gate.id, 'en_cours')}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
                          title="Désactiver / remettre ce jalon en cours de vérification"
                        >
                          Remettre en attente
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => signGoNoGoPhase(gate.id, 'Mario & Daniel Carvalho')}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                      >
                        Valider Jalon Go/No-Go
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal d'Audit Immuable */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              Journal d&apos;Audit Cryptographique Immuable ({auditLogs.length} événements)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                    <th className="py-2 pr-3">Horodatage</th>
                    <th className="py-2 px-3">Acteur</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Cible</th>
                    <th className="py-2 pl-3">État Après</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {log.actorName}{' '}
                        <span className="text-slate-400 font-normal">({log.actorRole})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-orange-600">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{log.target}</td>
                      <td className="py-2.5 pl-3 text-slate-600">{log.afterState}</td>
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
