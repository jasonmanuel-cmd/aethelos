export interface DemoEvent {
  id: string;
  type: 'lead' | 'appointment' | 'deal' | 'renewal' | 'system';
  title: string;
  description: string;
  severity: 'info' | 'success' | 'warning';
  timestamp: number;
}

const firstNames = ['Sarah', 'Mike', 'James', 'Emily', 'David', 'Lisa', 'Chris', 'Amanda', 'Brian', 'Rachel'];
const lastNames = ['Chen', 'Martinez', 'Thompson', 'Patel', 'Wilson', 'Kim', 'Davis', 'Garcia', 'Brown', 'Lee'];
const leadSources = ['Website', 'Referral', 'Google Ads', 'LinkedIn', 'Email Campaign'];
const policyTypes = ['Term Life', 'Auto', 'Homeowners', 'Annuity', 'Medicare Advantage'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const usedNames = new Set<string>();

function generateEvent(): DemoEvent {
  const types: DemoEvent['type'][] = ['lead', 'appointment', 'deal', 'renewal', 'system'];
  const type = Math.random() < 0.3 ? 'lead' : pick(types);

  switch (type) {
    case 'lead': {
      let name: string;
      do {
        name = `${pick(firstNames)} ${pick(lastNames)}`;
      } while (usedNames.has(name));
      usedNames.add(name);

      return {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'lead',
        title: `New Lead: ${name}`,
        description: `${pick(leadSources)} — interested in ${pick(policyTypes)}`,
        severity: 'success',
        timestamp: Date.now(),
      };
    }
    case 'appointment':
      return {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'appointment',
        title: 'Appointment Booked',
        description: `${pick(firstNames)} ${pick(lastNames)} confirmed for ${pick(['tomorrow', 'Thursday', 'Friday'])} at ${pick(['9:00', '10:30', '1:00', '2:30', '4:00'])}`,
        severity: 'info',
        timestamp: Date.now(),
      };
    case 'deal':
      return {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'deal',
        title: 'Deal Advanced',
        description: `${pick(policyTypes)} policy — moved to ${pick(['Proposal', 'Negotiation', 'Closing'])} stage`,
        severity: 'warning',
        timestamp: Date.now(),
      };
    case 'renewal':
      return {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'renewal',
        title: 'X-Date Approaching',
        description: `${pick(firstNames)} ${pick(lastNames)}'s ${pick(policyTypes)} policy expires in ${Math.floor(Math.random() * 30) + 1} days`,
        severity: 'warning',
        timestamp: Date.now(),
      };
    default:
      return {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'system',
        title: 'System Update',
        description: `${pick(['Leads synced', 'Campaign report ready', 'AI suggestions generated', 'Weekly summary available'])}`,
        severity: 'info',
        timestamp: Date.now(),
      };
  }
}

export function generateDemoEvents(count: number = 5): DemoEvent[] {
  return Array.from({ length: count }, () => generateEvent());
}
