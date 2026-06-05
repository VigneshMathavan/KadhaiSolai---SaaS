import { CharacterProfile, CharacterAlias } from '../types';

export class AliasResolutionEngine {
  static resolve(profiles: CharacterProfile[]): CharacterProfile[] {
    const resolved: CharacterProfile[] = [];
    const skipIds = new Set<string>();

    for (let i = 0; i < profiles.length; i++) {
      const current = profiles[i];
      if (skipIds.has(current.id)) continue;

      const mergedProfile = { ...current, aliases: [...current.aliases], mentionCount: current.mentionCount };
      
      // Compare against remaining profiles
      for (let j = i + 1; j < profiles.length; j++) {
        const candidate = profiles[j];
        if (skipIds.has(candidate.id)) continue;

        if (this.isAliasMatch(mergedProfile.name, candidate.name)) {
           // Merge candidate into current
           skipIds.add(candidate.id);
           mergedProfile.mentionCount += candidate.mentionCount;
           
           if (candidate.firstAppearance < mergedProfile.firstAppearance) {
             mergedProfile.firstAppearance = candidate.firstAppearance;
           }
           if (candidate.lastAppearance > mergedProfile.lastAppearance) {
             mergedProfile.lastAppearance = candidate.lastAppearance;
           }
           
           mergedProfile.aliases.push({
             aliasName: candidate.name,
             confidenceScore: 0.9,
             sourceStrategy: 'AliasResolutionEngine'
           });
           
           // If candidate name is longer/more formal, swap the primary name
           if (candidate.name.length > mergedProfile.name.length && !candidate.name.includes('.')) {
             mergedProfile.aliases.push({
               aliasName: mergedProfile.name,
               confidenceScore: 0.9,
               sourceStrategy: 'AliasResolutionEngine'
             });
             mergedProfile.name = candidate.name;
             mergedProfile.normalizedName = candidate.normalizedName;
           }
        }
      }
      
      // De-duplicate aliases
      const uniqueAliases = new Map<string, CharacterAlias>();
      for (const a of mergedProfile.aliases) uniqueAliases.set(a.aliasName, a);
      mergedProfile.aliases = Array.from(uniqueAliases.values()).filter(a => a.aliasName !== mergedProfile.name);

      resolved.push(mergedProfile);
    }

    return resolved;
  }

  private static isAliasMatch(nameA: string, nameB: string): boolean {
    const a = nameA.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|திரு\.|திருமதி\.)\s*/, '').trim();
    const b = nameB.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|திரு\.|திருமதி\.)\s*/, '').trim();
    
    if (a === b) return true;
    
    // Partial inclusion (e.g., "Arjun" and "Arjun Kumar")
    if (a.length > 3 && b.length > 3) {
      if (a.includes(b) || b.includes(a)) return true;
    }
    
    // Tamil suffix stripping (e.g., Arjunan -> Arjun)
    const aRoot = a.replace(/(ன்|கள்|ற்கு|க்கு)$/, '');
    const bRoot = b.replace(/(ன்|கள்|ற்கு|க்கு)$/, '');
    if (aRoot === bRoot && aRoot.length > 3) return true;

    return false;
  }
}
