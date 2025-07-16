import { Preferences } from '@capacitor/preferences';
import { TipService } from './TipService';
import { Tip, Rarity } from '../models/Tip';

const rarityWeights: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  super_rare: 4,
  epic: 1,
};

export class TipManager {
  constructor(private tipService: TipService) {}

  async getHandledTipIds(): Promise<string[]> {
    const { value } = await Preferences.get({ key: 'handled_tip_id' });
    return value ? JSON.parse(value) : [];
  }

  async getUnlockedCollections(): Promise<string[]> {
    const { value } = await Preferences.get({ key: 'unlocked_collections' });
    return value ? JSON.parse(value) : [];
  }

  async getCompletedCollections(): Promise<string[]> {
    const { value } = await Preferences.get({ key: 'completed_collections' });
    return value ? JSON.parse(value) : [];
  }

  async saveHandledTipId(tipId: string) {
    const ids = await this.getHandledTipIds();
    if (!ids.includes(tipId)) {
      ids.push(tipId);
      await Preferences.set({ key: 'handled_tip_id', value: JSON.stringify(ids) });
    }
  }

  async unlockTip(tip: Tip) {
    await this.saveHandledTipId(tip.id);
    this.tipService.unlockTip(tip.id);
    // Puedes agregar aquí la lógica de colecciones si lo deseas
  }

  async getWeightedRandomTip(): Promise<Tip> {
    const handledIds = await this.getHandledTipIds();
    const allTips = this.tipService.getAllTips();

    if (handledIds.length === allTips.length) {
      const randomIndex = Math.floor(Math.random() * allTips.length);
      return allTips[randomIndex];
    }

    const availableTips = allTips.filter(tip => !handledIds.includes(tip.id));
    if (availableTips.length === 0) {
      const randomIndex = Math.floor(Math.random() * allTips.length);
      return allTips[randomIndex];
    }

    const weightedTips: Tip[] = [];
    availableTips.forEach(tip => {
      const weight = rarityWeights[tip.rarity] || 1;
      for (let i = 0; i < weight; i++) {
        weightedTips.push(tip);
      }
    });

    const randomIndex = Math.floor(Math.random() * weightedTips.length);
    return weightedTips[randomIndex];
  }

    async getCollectionsGrouped(): Promise<Record<string, { unlocked: Tip[]; locked: Tip[] }>> {
    const unlockedIds = await this.getHandledTipIds();
    const allTips = this.tipService.getAllTips();
    const grouped: Record<string, { unlocked: Tip[]; locked: Tip[] }> = {};
    allTips.forEach((tip) => {
      const isUnlocked = unlockedIds.includes(tip.id);
      const collection = tip.collection ?? '';
      if (!grouped[collection]) {
        grouped[collection] = { unlocked: [], locked: [] };
      }
      grouped[collection][isUnlocked ? 'unlocked' : 'locked'].push(tip);
    });
    // Opcional: filtra colecciones sin tips desbloqueados y ordena
    const filtered = Object.fromEntries(
      Object.entries(grouped)
        .filter(([, group]) => group.unlocked.length > 0)
        .sort(([a], [b]) => a.localeCompare(b))
    );
    return filtered;
  }
}