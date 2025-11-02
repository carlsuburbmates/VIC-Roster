/**
 * Centralized API client module
 * All backend endpoints defined here for easy maintenance and environment-specific configuration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const endpoints = {
  profiles: `${API_BASE_URL}/profiles`,
  generateRoster: `${API_BASE_URL}/generate-roster`,
  exportExcel: `${API_BASE_URL}/export-excel`,
  submitProfile: `${API_BASE_URL}/submit-profile`,
};

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - Endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<{ok: boolean, data: any, error: string|null}>}
 */
export async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // Handle non-OK responses
    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {
        // If response body isn't JSON, use status message
        errorMsg = response.statusText || errorMsg;
      }
      return {
        ok: false,
        data: null,
        error: errorMsg,
      };
    }

    // Handle successful responses
    const data = await response.json();
    return {
      ok: true,
      data,
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err.message || 'Network error. Is the backend running?',
    };
  }
}

/**
 * Submit a staff profile
 * @param {object} profile - Profile data
 * @returns {Promise<{ok: boolean, data: any, error: string|null}>}
 */
export async function submitProfile(profile) {
  return apiCall(endpoints.submitProfile, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
}

/**
 * Fetch all staff profiles
 * @returns {Promise<{ok: boolean, data: array, error: string|null}>}
 */
export async function fetchProfiles() {
  return apiCall(endpoints.profiles);
}

/**
 * Generate roster (trigger solver)
 * @returns {Promise<{ok: boolean, data: object, error: string|null}>}
 */
export async function generateRoster() {
  return apiCall(endpoints.generateRoster);
}

/**
 * Export roster to Excel
 * Triggers file download
 * @returns {Promise<boolean>} - true if successful
 */
export async function exportRosterExcel() {
  try {
    const response = await fetch(endpoints.exportExcel);
    if (!response.ok) {
      console.error('Export failed:', response.status, response.statusText);
      return false;
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Roster_Request.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (err) {
    console.error('Export error:', err.message);
    return false;
  }
}

export default {
  endpoints,
  apiCall,
  submitProfile,
  fetchProfiles,
  generateRoster,
  exportRosterExcel,
};
