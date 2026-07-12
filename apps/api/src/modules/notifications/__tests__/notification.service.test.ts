import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '../notification.service.js';

vi.mock('@erp/database', () => ({ prisma: { user: { findMany: vi.fn().mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]) } } }));
vi.mock('../../config/index.js', () => ({
  logger: { info: vi.fn() },
  notificationQueue: { add: vi.fn().mockResolvedValue({}) },
  emitToUser: vi.fn(),
}));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  create: vi.fn().mockResolvedValue({ id: 'n1' }),
  createMany: vi.fn(),
  findById: vi.fn(),
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getUserNotifications: vi.fn().mockResolvedValue([]),
  getUnreadCount: vi.fn().mockResolvedValue(3),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  updateStatus: vi.fn(),
  incrementRetry: vi.fn(),
  listTemplates: vi.fn().mockResolvedValue([]),
  findTemplateByCode: vi.fn(),
  createTemplate: vi.fn().mockResolvedValue({ id: 't1', code: 'welcome', channel: 'email' }),
  updateTemplate: vi.fn().mockResolvedValue({ id: 't1' }),
  deleteTemplate: vi.fn(),
  getDeliveryStats: vi.fn().mockResolvedValue({ total: 100, sent: 80, delivered: 70, failed: 5, deliveryRate: 85, byChannel: [] }),
};
vi.mock('../notification.repository.js', () => ({ notificationRepository: mockRepo }));

describe('NotificationService', () => {
  let service: NotificationService;
  beforeEach(() => { service = new NotificationService(); vi.clearAllMocks(); });

  it('queues notifications for delivery', async () => {
    const r = await service.send('t1', { recipientIds: ['u1', 'u2'], channel: 'email', body: 'Hello' }, 'actor');
    expect(r.queued).toBe(2);
  });

  it('emits real-time for in_app channel', async () => {
    const { emitToUser } = await import('../../config/index.js');
    await service.send('t1', { recipientIds: ['u1'], channel: 'in_app', body: 'Hello' }, 'actor');
    expect(emitToUser).toHaveBeenCalledWith('u1', 'notification:new', expect.any(Object));
  });

  it('returns unread count', async () => {
    const count = await service.getUnreadCount('u1');
    expect(count).toBe(3);
  });

  it('creates a template', async () => {
    mockRepo.findTemplateByCode.mockResolvedValue(null);
    const r = await service.createTemplate('t1', { name: 'Welcome', code: 'welcome', channel: 'email', body: 'Hello {{name}}' }, 'actor');
    expect(r.code).toBe('welcome');
  });

  it('rejects duplicate template', async () => {
    mockRepo.findTemplateByCode.mockResolvedValue({ id: 'existing' });
    await expect(service.createTemplate('t1', { name: 'Dup', code: 'welcome', channel: 'email', body: 'x' }, 'actor')).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});

