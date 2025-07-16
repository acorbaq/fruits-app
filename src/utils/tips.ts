export type Rarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'epic';

export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return 'medium';
    case 'uncommon':
      return 'success';
    case 'rare':
      return 'primary';
    case 'super_rare':
      return 'tertiary';
    case 'epic':
      return 'warning';
    default:
      return 'medium';
  }
}

export function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return 'Común';
    case 'uncommon':
      return 'Poco común';
    case 'rare':
      return 'Raro';
    case 'super_rare':
      return 'Súper raro';
    case 'epic':
      return 'Épico';
    default:
      return '';
  }
}

export function getRarityBorderClass(rarity: Rarity): string {
  return `border-${rarity}`;
}