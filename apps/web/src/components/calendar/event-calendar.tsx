'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function EventCalendar() {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      const params = new URLSearchParams(window.location.search);
      params.set('date', value.toISOString());
      router.push(`${window.location.pathname}?${params}`);
    }
  }, [value, router]);

  return <Calendar onChange={onChange} value={value} />;
}
