
// Shared User Data Bridge
// This file serves as the single source of truth for user identity during development/mocking phase.

export interface SharedUserIdentity {
    id: string;
    email: string; // Key identifier for linking
    name: string;
    avatarUrl: string;
    whatsapp: string;
    globalId: string; // The unified RS Global ID
}

export const SHARED_USERS: SharedUserIdentity[] = [
    {
        id: 'rsprolipsi',
        globalId: 'RS-MASTER-001',
        name: 'RS Prólipsi',
        email: 'rsprolipsioficial@gmail.com',
        avatarUrl: 'https://placehold.co/150/000000/FFD700?text=RS', // Official RS Logo Placeholder
        whatsapp: '5541992863922'
    },
    // Add more shared users here as needed testing
];

export const getSharedUserByEmail = (email: string) => {
    return SHARED_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
};

export const getSharedAvatar = (email: string) => {
    const user = getSharedUserByEmail(email);
    if (user) return user.avatarUrl;

    // Fallback programmatic generation logic (same as in NetworkTree)
    // This ensures even unknown users get the correct "Identity"
    return null;
};
