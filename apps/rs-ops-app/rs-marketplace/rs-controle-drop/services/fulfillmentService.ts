import { Order, Customer, DistributionCenter, ProductStockLocation } from '../types';

/**
 * Checks if a customer's ZIP code falls within any of the ranges of a Distribution Center.
 */
const isZipCodeInRange = (customerZip: string, ranges: { start: string, end: string }[]): boolean => {
    const zip = parseInt(customerZip.replace(/\D/g, ''), 10);
    if (isNaN(zip)) return false;

    for (const range of ranges) {
        const start = parseInt(range.start.replace(/\D/g, ''), 10);
        const end = parseInt(range.end.replace(/\D/g, ''), 10);
        if (!isNaN(start) && !isNaN(end) && zip >= start && zip <= end) {
            return true;
        }
    }
    return false;
};

/**
 * Checks if a Distribution Center has enough stock for all items in an order.
 */
const hasStockForOrder = (order: Order, centerId: string, stockLocations: ProductStockLocation[]): boolean => {
    return order.items.every(item => {
        const stockLocation = stockLocations.find(
            sl => sl.productId === item.productId && sl.centerId === centerId
        );
        return stockLocation && stockLocation.stock >= item.quantity;
    });
};

export const fulfillmentService = {
    /**
     * Assigns the best Distribution Center (CD) for an order based on rules.
     * Rule 1: Find CDs that serve the customer's ZIP code.
     * Rule 2: From those, find CDs that have stock for all items.
     * Rule 3: Return the first one found (simplistic approach).
     * Returns the ID of the best CD, or null if none is suitable.
     */
    assignBestCD(
        order: Order, 
        customer: Customer, 
        distributionCenters: DistributionCenter[],
        stockLocations: ProductStockLocation[]
    ): string | null {
        if (!customer.address.zipCode) {
            return null; // Cannot determine without a ZIP code
        }

        // Rule 1: Filter CDs by ZIP code range
        const eligibleCentersByZip = distributionCenters.filter(cd => 
            isZipCodeInRange(customer.address.zipCode, cd.zipCodeRanges)
        );

        if (eligibleCentersByZip.length === 0) {
            // Fallback: if no CD covers the specific ZIP, consider all CDs (or a default one)
            // For now, we return null, but a real-world scenario would have a fallback logic.
            return null;
        }

        // Rule 2: Find the first center from the eligible list that has stock
        for (const center of eligibleCentersByZip) {
            if (hasStockForOrder(order, center.id, stockLocations)) {
                return center.id; // Rule 3: Return the first suitable CD
            }
        }
        
        // No suitable CD found with both location and stock criteria
        return null;
    }
};
