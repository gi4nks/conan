import db from '@/lib/db';
import InboxList from '@/components/InboxList';

export const dynamic = 'force-dynamic';

export default function InboxPage() {
  const items = db.prepare("SELECT id, title, created_at FROM pages WHERE category = 'inbox' ORDER BY created_at DESC").all() as any[];

  return (
    <div className="w-full py-8 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inbox Processing</h1>
        <p className="text-base-content/60">Review and organize your captured items.</p>
      </div>
      <InboxList items={items} />
    </div>
  );
}
