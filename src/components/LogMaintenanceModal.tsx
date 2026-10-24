import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Field, Modal } from './ui';
import { usePlant } from '../context/PlantContext';
import { useToast } from '../context/ToastContext';
import { TECHNICIANS } from '../lib/mock';
import type { MaintenanceRecord } from '../types';

export function LogMaintenanceModal({ open, machineId, onClose }: { open: boolean; machineId?: string; onClose: () => void }) {
  const { machines, addMaintenance } = usePlant();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    await addMaintenance({
      machineId: String(f.get('machine')), issue: String(f.get('issue')), action: String(f.get('action')), technician: String(f.get('tech')),
      status: String(f.get('status')) as MaintenanceRecord['status'], date: new Date().toISOString(), downtimeMin: 0,
      cost: Number(f.get('cost')) || 0, parts: String(f.get('parts') || '—'),
    });
    setBusy(false);
    toast('Work order saved.');
    onClose();
  };
  return (
    <Modal open={open} title="Log maintenance" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Machine"><select name="machine" className="field" defaultValue={machineId}>{machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
        <Field label="Issue"><input name="issue" required className="field" placeholder="e.g. Bearing noise" /></Field>
        <Field label="Action planned or taken"><input name="action" required className="field" /></Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Technician"><select name="tech" className="field">{TECHNICIANS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Status"><select name="status" className="field"><option>Scheduled</option><option>In Progress</option><option>Completed</option></select></Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Parts used (optional)"><input name="parts" className="field" placeholder="e.g. 6310 bearing" /></Field>
          <Field label="Estimated cost in ₹ (optional)"><input name="cost" type="number" min="0" className="field" /></Field>
        </div>
        <Button variant="primary" type="submit" disabled={busy} className="w-full">{busy ? 'Saving…' : 'Save work order'}</Button>
      </form>
    </Modal>
  );
}
