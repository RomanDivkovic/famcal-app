/**
 * Data Service Factory
 * Creates the appropriate data service based on environment configuration
 */

import { IDataService } from './IDataService';
import { firebaseService } from './firebaseService';
import { apiService } from './apiService';

// Determine which service to use based on environment variable
const USE_FIREBASE = process.env.EXPO_PUBLIC_USE_FIREBASE === 'true';

/**
 * Get the current data service instance
 * This allows easy switching between Firebase and custom API
 */
export const getDataService = (): IDataService => {
  if (USE_FIREBASE) {
    console.log('Using Firebase service');
    return firebaseService;
  } else {
    console.log('Using custom API service');
    return apiService;
  }
};

// Export a singleton instance
export const dataService = getDataService();

// Also export the services individually if needed
export { firebaseService, apiService };

// Export notification service
export { notificationService } from './notificationService';
