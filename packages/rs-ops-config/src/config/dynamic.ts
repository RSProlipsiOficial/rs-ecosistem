import { RULES } from './rules';

export interface ConfigProvider {
    getRule<T>(section: keyof typeof RULES, key: string): Promise<T | null>;
}

let provider: ConfigProvider | null = null;

export const setConfigProvider = (p: ConfigProvider) => {
    provider = p;
};

export const getRule = async <T>(section: keyof typeof RULES, key: string, defaultValue: T): Promise<T> => {
    if (provider) {
        try {
            const val = await provider.getRule<T>(section, key);
            if (val !== null && val !== undefined) return val;
        } catch (e) {
            console.warn(`Failed to fetch dynamic rule ${String(section)}.${key}, using default.`);
        }
    }

    // Fallback to static RULES
    const sectionRules = RULES[section] as any;
    return (sectionRules && sectionRules[key] !== undefined) ? sectionRules[key] : defaultValue;
};
