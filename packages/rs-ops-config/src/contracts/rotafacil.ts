/**
 * RS Prólipsi - Rotafacil Contracts
 */

export interface DeliveryRoute {
    routeId: string;
    driverId: string;
    vehicleId: string;
    stops: Array<{
        orderId: string;
        address: string;
        sequence: number;
        estimatedArrival: string;
    }>;
    status: 'planned' | 'active' | 'completed';
}

export interface DriverLocation {
    driverId: string;
    lat: number;
    lng: number;
    timestamp: string;
    speed?: number;
    heading?: number;
}
