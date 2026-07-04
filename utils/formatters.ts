export const toRoman = (num: number): string => {
    if (num <= 0) return num.toString();
    const roman: Record<string, number> = {
        M: 1000, CM: 900, D: 500, CD: 400,
        C: 100, XC: 90, L: 50, XL: 40,
        X: 10, IX: 9, V: 5, IV: 1, I: 1
    };
    let str = '';
    let tempNum = num;
    for (const i of Object.keys(roman)) {
        const q = Math.floor(tempNum / roman[i]);
        tempNum -= q * roman[i];
        str += i.repeat(q);
    }
    return str;
};

export const toArmenian = (num: number): string => {
    if (num <= 0 || num > 9999) return num.toString();
    const units = ['', 'Ա', 'Բ', 'Գ', 'Դ', 'Ե', 'Զ', 'Է', 'Ը', 'Թ'];
    const tens = ['', 'Ժ', 'Ի', 'Լ', 'Խ', 'Ծ', 'Կ', 'Հ', 'Ձ', 'Ղ'];
    const hundreds = ['', 'Ճ', 'Մ', 'Յ', 'Ն', 'Շ', 'Ո', 'Չ', 'Պ', 'Ջ'];
    const thousands = ['', 'Ռ', 'Ս', 'Վ', 'Տ', 'Ր', 'Ց', 'Ւ', 'Փ', 'Ք'];

    const t = Math.floor(num / 1000);
    const h = Math.floor((num % 1000) / 100);
    const te = Math.floor((num % 100) / 10);
    const u = num % 10;

    return `${thousands[t]}${hundreds[h]}${tens[te]}${units[u]}`;
};

export type TileStyle = 'standard' | 'roman' | 'armenian';
export type ThemeColor = 'indigo' | 'rose' | 'emerald' | 'amber';

export const formatTileValue = (val: number, style: TileStyle): string => {
    if (val === 0) return '';
    switch (style) {
        case 'roman':
            return toRoman(val);
        case 'armenian':
            return toArmenian(val);
        case 'standard':
        default:
            return val.toString();
    }
};
