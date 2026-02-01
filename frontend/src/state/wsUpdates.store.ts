import { Subject } from 'rxjs';

export type UpdateEvent = {
  entity: 'album' | 'artista' | 'banda';
  action: string;
  id?: number | null;
};

export const updates$ = new Subject<UpdateEvent>();

export function emitUpdate(event: UpdateEvent) {
  updates$.next(event);
}
