import fs from 'fs';
import path from 'path';

import { canvasIcon } from '@/utils/canvas-icons';

/**
 * The canvas names an icon per step of the create flow. These were picked by
 * eye before the canvas was readable, and three of the four differed - it
 * reaches for the "add" variants on date, guests and wallet, and Ticket01
 * rather than Ticket02.
 *
 * Read out of the source rather than imported: the steps live in a module that
 * pulls in the whole create flow, and this only needs the strings.
 */
const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');

const CANVAS_STEP_ICONS: Record<string, string> = {
  'calendar-add-01': 'Dates & Type',
  'information-circle': 'About',
  'ticket-01': 'Tickets',
  'user-add-01': 'Invite Guests',
  'wallet-01': 'Wallet Details',
  'location-01': 'Itinerary',
};

describe('create flow step icons', () => {
  it.each(Object.entries(CANVAS_STEP_ICONS))(
    'uses the canvas icon %s for the %s step',
    (canvasName) => {
      // The canvas stores step icons bare and prefixes them at render time
      const resolved = canvasIcon(`hgi-${canvasName}`);

      expect(resolved).toBeDefined();
      expect(source).toContain(`'${resolved}'`);
    },
  );

  // The ones they were on before, so a revert is caught rather than silent
  it.each(['CalendarIcon', 'Ticket02Icon', 'AddTeamIcon', 'WalletAdd02Icon', 'RouteBlockIcon'])(
    'no longer carries the guessed %s',
    (old) => {
      expect(source).not.toContain(`'${old}'`);
    },
  );
});
