/**
 * Format patient IDs for display
 * Handles both new format (sds-YY-MM-NNN) and legacy format (numeric IDs)
 */

function formatPatientId(id) {
    if (!id) return 'N/A';
    
    // Check if already in new format
    if (typeof id === 'string' && id.startsWith('sds-')) {
        return id;
    }
    
    // Convert numeric/legacy IDs to new format
    const idStr = String(id).trim();
    
    // If it's just a number, format it as legacy
    if (/^\d+$/.test(idStr)) {
        const paddedId = String(idStr).padStart(3, '0');
        return `sds-legacy-${paddedId}`;
    }
    
    // Return as-is if it doesn't match patterns
    return id;
}

module.exports = { formatPatientId };
