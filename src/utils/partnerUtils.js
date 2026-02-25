/**
 * Partner utility functions for consistent partner display across the application
 */

export const PARTNER_TYPE_LABELS = {
  organization: 'Organization',
  diagnostic: 'Diagnostic',
  collection_center: 'Collection Center',
  processing_center: 'Processing Center',
}

/**
 * Get formatted partner label with name and type in brackets
 * @param {Object} partner - Partner object with name and partnerType
 * @returns {string} Formatted label like "Partner Name (Partner Type)"
 */
export function getPartnerLabel(partner) {
  if (!partner) return '—'
  const typeName = PARTNER_TYPE_LABELS[partner.partnerType] || partner.partnerType.replace(/_/g, ' ')
  return `${partner.name} (${typeName})`
}

/**
 * Get partner type label
 * @param {string} partnerType - Partner type key
 * @returns {string} Human-readable partner type label
 */
export function getPartnerTypeLabel(partnerType) {
  return PARTNER_TYPE_LABELS[partnerType] || partnerType.replace(/_/g, ' ')
}

