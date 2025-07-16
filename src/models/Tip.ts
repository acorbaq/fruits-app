export type Rarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'epic';

export interface Tip {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  unlocked: boolean;
  collection?: string;
  // Agrega otros campos según tu necesidad
}