import React from 'react';
import { X } from 'lucide-react';
import { CFITNESS_LEGAL_IDENTITY } from '../domain/rules';

interface ContractPreviewModalProps {
  contractText: string | null;
  onClose: () => void;
}

export function ContractPreviewModal({ contractText, onClose }: ContractPreviewModalProps) {
  if (!contractText) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-violet-600">
              Modèle Officiel C.FITNESS (SIRET {CFITNESS_LEGAL_IDENTITY.siret} · IDCC 2511 Gr. 1)
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Contrat de Travail CDI Temps Complet (35h / 151,67h — 1 823,03 € brut)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
            {contractText}
          </pre>
        </div>
      </div>
    </div>
  );
}
