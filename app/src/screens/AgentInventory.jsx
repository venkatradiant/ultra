import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import EnterpriseAgentInventory from '../components/nfcu/platform-admin/EnterpriseAgentInventory';

/**
 * Agent Inventory — the standing view of the governance registry. Spec v2 lists
 * it as one of the AI Governance Admin's nav modules, alongside Governance and
 * Observability.
 *
 * Same component as turn 9: the conversation reaches the registry through the
 * flow, and this page is where Daniel lives in it. Persona-gated the same way
 * Governance is (screens/Governance.jsx) — only the AI Governance Admin lists
 * this nav slot, and the guard stops a hand-typed URL rendering an empty page.
 */
export default function AgentInventory() {
  const persona = usePersona();

  if (persona.id !== 'nfcu_platform_admin') {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Agent Inventory is available for the NFCU AI Governance Admin only.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-w-0"
        >
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-brand" />
            <h1 className="text-lg font-bold text-text">Agent Inventory</h1>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Every AI agent running across the enterprise, whatever it is built on, and whether it is under governance.
          </p>
        </motion.div>

        <EnterpriseAgentInventory />
      </div>
    </div>
  );
}
