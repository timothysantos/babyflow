import { useState } from 'react';
import type { BabyDraft, PreferredLanguage } from '../../../domain/baby/baby.types';

type Props = {
  onCreate: (draft: BabyDraft) => void;
  preferredLanguage: PreferredLanguage;
};

export function BabyForm({ onCreate, preferredLanguage }: Props) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [timezone, setTimezone] = useState('Asia/Singapore');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({ name, birthDate, timezone, preferredLanguage });
      }}
    >
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Birth date
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </label>
      <label>
        Timezone
        <input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
      </label>
      <button type="submit">Create baby</button>
    </form>
  );
}
