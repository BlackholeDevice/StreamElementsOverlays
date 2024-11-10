export interface KillEvent {
  timestamp: number;
  logLevel: string;
  victim: string;
  victimId: number;
  victimIsNpc: boolean;
  zone: string;
  attacker: string;
  attackerId: string;
  attackerIsNpc: boolean;
  weapon: string;
  weaponClass: string;
  damageType: string;
  directionX: number;
  directionY: number;
  directionZ: number;
  [key: string]: any;
}
