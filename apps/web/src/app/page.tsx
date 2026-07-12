import { redirect } from 'next/navigation';

// Root redirects to /home which is handled by the (public) route group
export default function RootRedirect() {
  redirect('/home');
}
