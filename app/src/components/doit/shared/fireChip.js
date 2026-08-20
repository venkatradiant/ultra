/**
 * Moved to `components/common/fireChip.js` when AMISA's assignment overlay
 * needed the same bridge. Re-exported from the old path so the VOCE modals that
 * import it here keep working; new code should import from common.
 */
export { fireChip, closeThenFireChip } from '../../common/fireChip';
