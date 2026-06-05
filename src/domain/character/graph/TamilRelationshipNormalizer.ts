export class TamilRelationshipNormalizer {
  static normalize(term: string): { type: string; directionality: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL' } {
    const t = term.toLowerCase().trim();

    // Mapping regional/cultural variations into canonical edges
    switch (t) {
      case 'அப்பா':
      case 'தந்தை':
      case 'பிதா':
        return { type: 'FATHER', directionality: 'UNIDIRECTIONAL' };
      case 'அம்மா':
      case 'தாய்':
      case 'மாதா':
        return { type: 'MOTHER', directionality: 'UNIDIRECTIONAL' };
      case 'அண்ணன்':
      case 'தம்பி':
      case 'சகோதரன்':
        return { type: 'BROTHER', directionality: 'BIDIRECTIONAL' };
      case 'அக்கா':
      case 'தங்கை':
      case 'சகோதரி':
        return { type: 'SISTER', directionality: 'BIDIRECTIONAL' };
      case 'மாமா':
      case 'மாமன்':
      case 'மாமனார்':
        return { type: 'UNCLE_MATERNAL_OR_INLAW', directionality: 'UNIDIRECTIONAL' };
      case 'அத்தை':
      case 'மாமியார்':
        return { type: 'AUNT_PATERNAL_OR_INLAW', directionality: 'UNIDIRECTIONAL' };
      case 'சித்தப்பா':
      case 'பெரியப்பா':
        return { type: 'UNCLE_PATERNAL', directionality: 'UNIDIRECTIONAL' };
      case 'சித்தி':
      case 'பெரியம்மா':
        return { type: 'AUNT_MATERNAL', directionality: 'UNIDIRECTIONAL' };
      case 'மச்சான்':
      case 'மைத்துனர்':
        return { type: 'BROTHER_IN_LAW', directionality: 'BIDIRECTIONAL' };
      case 'மச்சினி':
      case 'நாத்தனார்':
        return { type: 'SISTER_IN_LAW', directionality: 'BIDIRECTIONAL' };
      case 'மருமகன்':
        return { type: 'SON_IN_LAW', directionality: 'UNIDIRECTIONAL' };
      case 'மருமகள்':
        return { type: 'DAUGHTER_IN_LAW', directionality: 'UNIDIRECTIONAL' };
      case 'தாத்தா':
        return { type: 'GRANDFATHER', directionality: 'UNIDIRECTIONAL' };
      case 'பாட்டி':
        return { type: 'GRANDMOTHER', directionality: 'UNIDIRECTIONAL' };
      case 'பேரன்':
        return { type: 'GRANDSON', directionality: 'UNIDIRECTIONAL' };
      case 'பேத்தி':
        return { type: 'GRANDDAUGHTER', directionality: 'UNIDIRECTIONAL' };
      case 'கணவர்':
      case 'கணவன்':
      case 'பர்த்தா':
        return { type: 'HUSBAND', directionality: 'BIDIRECTIONAL' };
      case 'மனைவி':
      case 'பொண்டாட்டி':
      case 'தாரம்':
        return { type: 'WIFE', directionality: 'BIDIRECTIONAL' };
      case 'காதலன்':
      case 'காதலி':
        return { type: 'LOVER', directionality: 'BIDIRECTIONAL' };
      case 'நண்பன்':
      case 'தோழன்':
      case 'தோழி':
        return { type: 'FRIEND', directionality: 'BIDIRECTIONAL' };
      case 'எதிரி':
      case 'பகைவன்':
        return { type: 'ENEMY', directionality: 'BIDIRECTIONAL' };
      case 'குரு':
      case 'ஆசிரியர்':
        return { type: 'TEACHER', directionality: 'UNIDIRECTIONAL' };
      case 'சிஷ்யன்':
      case 'மாணவன்':
        return { type: 'STUDENT', directionality: 'UNIDIRECTIONAL' };
      default:
        return { type: t.toUpperCase(), directionality: 'UNIDIRECTIONAL' };
    }
  }

  static getKeywords(): string[] {
    return [
      'அப்பா', 'தந்தை', 'அம்மா', 'தாய்', 'அண்ணன்', 'தம்பி', 'அக்கா', 'தங்கை',
      'மாமா', 'அத்தை', 'சித்தப்பா', 'பெரியப்பா', 'சித்தி', 'பெரியம்மா',
      'மச்சான்', 'மைத்துனர்', 'மச்சினி', 'நாத்தனார்', 'மருமகன்', 'மருமகள்',
      'தாத்தா', 'பாட்டி', 'பேரன்', 'பேத்தி', 'கணவர்', 'மனைவி', 'காதலன்', 'காதலி',
      'நண்பன்', 'தோழி', 'எதிரி', 'குரு', 'சிஷ்யன்'
    ];
  }
}
