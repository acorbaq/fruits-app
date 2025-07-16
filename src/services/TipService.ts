import { Tip } from '../models/Tip';

export class TipService {
  private tips: Tip[] = [];

  constructor(initialTips: Tip[]) {
    this.tips = initialTips;
  }

  getAllTips(): Tip[] {
    return this.tips;
  }

  getTipById(id: string): Tip | undefined {
    return this.tips.find(tip => tip.id === id);
  }

  unlockTip(id: string): void {
    const tip = this.getTipById(id);
    if (tip) {
      tip.unlocked = true;
    }
  }

  getUnlockedTips(): Tip[] {
    return this.tips.filter(tip => tip.unlocked);
  }

  getTipsByCollection(collection: string): Tip[] {
    return this.tips.filter(tip => tip.collection === collection);
  }

  // Puedes agregar más métodos según lo que necesites
}