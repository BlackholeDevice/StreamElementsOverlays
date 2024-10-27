export interface KillEvent {
  victim: string;
  attacker: string;
  zone: string;
  using: string;
  damageType: string;
  timestamp: number;
}
