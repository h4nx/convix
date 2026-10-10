// GENERADO por scripts/gen-routes.mjs — no editar a mano.
import type { RouteModule } from './route-types';
import * as r0 from './routes/account/route';
import * as r1 from './routes/automations/route';
import * as r2 from './routes/db/route';
import * as r3 from './routes/flows/route';
import * as r4 from './routes/health/route';
import * as r5 from './routes/account/api-keys/route';
import * as r6 from './routes/account/invitations/route';
import * as r7 from './routes/account/members/route';
import * as r8 from './routes/account/transfer-ownership/route';
import * as r9 from './routes/ai/config/route';
import * as r10 from './routes/ai/draft/route';
import * as r11 from './routes/ai/knowledge/route';
import * as r12 from './routes/ai/playground/route';
import * as r13 from './routes/ai/test/route';
import * as r14 from './routes/auth/forgot-password/route';
import * as r15 from './routes/auth/login/route';
import * as r16 from './routes/auth/logout/route';
import * as r17 from './routes/auth/providers/route';
import * as r18 from './routes/auth/reset-password/route';
import * as r19 from './routes/auth/session/route';
import * as r20 from './routes/auth/signup/route';
import * as r21 from './routes/auth/update-user/route';
import * as r22 from './routes/automations/cron/route';
import * as r23 from './routes/automations/engine/route';
import * as r24 from './routes/flows/cron/route';
import * as r25 from './routes/flows/templates/route';
import * as r26 from './routes/realtime/broadcast/route';
import * as r27 from './routes/realtime/sse/route';
import * as r28 from './routes/v1/broadcasts/route';
import * as r29 from './routes/v1/contacts/route';
import * as r30 from './routes/v1/conversations/route';
import * as r31 from './routes/v1/me/route';
import * as r32 from './routes/v1/messages/route';
import * as r33 from './routes/v1/webhooks/route';
import * as r34 from './routes/whatsapp/broadcast/route';
import * as r35 from './routes/whatsapp/config/route';
import * as r36 from './routes/whatsapp/react/route';
import * as r37 from './routes/whatsapp/send/route';
import * as r38 from './routes/whatsapp/webhook/route';
import * as r39 from './routes/ai/knowledge/reindex/route';
import * as r40 from './routes/auth/oidc/callback/route';
import * as r41 from './routes/auth/oidc/login/route';
import * as r42 from './routes/whatsapp/config/verify-registration/route';
import * as r43 from './routes/whatsapp/templates/submit/route';
import * as r44 from './routes/whatsapp/templates/sync/route';
import * as r45 from './routes/account/api-keys/[id]/route';
import * as r46 from './routes/account/invitations/[id]/route';
import * as r47 from './routes/account/members/[userId]/route';
import * as r48 from './routes/ai/knowledge/[id]/route';
import * as r49 from './routes/v1/broadcasts/[id]/route';
import * as r50 from './routes/v1/contacts/[id]/route';
import * as r51 from './routes/v1/conversations/[id]/route';
import * as r52 from './routes/v1/webhooks/[id]/route';
import * as r53 from './routes/whatsapp/media/[mediaId]/route';
import * as r54 from './routes/whatsapp/templates/[id]/route';
import * as r55 from './routes/v1/conversations/[id]/messages/route';
import * as r56 from './routes/automations/[id]/route';
import * as r57 from './routes/flows/[id]/route';
import * as r58 from './routes/storage/[bucket]/route';
import * as r59 from './routes/automations/[id]/duplicate/route';
import * as r60 from './routes/flows/[id]/activate/route';
import * as r61 from './routes/flows/[id]/runs/route';
import * as r62 from './routes/invitations/[token]/peek/route';
import * as r63 from './routes/invitations/[token]/redeem/route';
import * as r64 from './routes/storage/[bucket]/[...path]/route';

export const routes: { pattern: string; module: RouteModule }[] = [
  { pattern: '/api/account', module: r0 as unknown as RouteModule },
  { pattern: '/api/automations', module: r1 as unknown as RouteModule },
  { pattern: '/api/db', module: r2 as unknown as RouteModule },
  { pattern: '/api/flows', module: r3 as unknown as RouteModule },
  { pattern: '/api/health', module: r4 as unknown as RouteModule },
  { pattern: '/api/account/api-keys', module: r5 as unknown as RouteModule },
  { pattern: '/api/account/invitations', module: r6 as unknown as RouteModule },
  { pattern: '/api/account/members', module: r7 as unknown as RouteModule },
  { pattern: '/api/account/transfer-ownership', module: r8 as unknown as RouteModule },
  { pattern: '/api/ai/config', module: r9 as unknown as RouteModule },
  { pattern: '/api/ai/draft', module: r10 as unknown as RouteModule },
  { pattern: '/api/ai/knowledge', module: r11 as unknown as RouteModule },
  { pattern: '/api/ai/playground', module: r12 as unknown as RouteModule },
  { pattern: '/api/ai/test', module: r13 as unknown as RouteModule },
  { pattern: '/api/auth/forgot-password', module: r14 as unknown as RouteModule },
  { pattern: '/api/auth/login', module: r15 as unknown as RouteModule },
  { pattern: '/api/auth/logout', module: r16 as unknown as RouteModule },
  { pattern: '/api/auth/providers', module: r17 as unknown as RouteModule },
  { pattern: '/api/auth/reset-password', module: r18 as unknown as RouteModule },
  { pattern: '/api/auth/session', module: r19 as unknown as RouteModule },
  { pattern: '/api/auth/signup', module: r20 as unknown as RouteModule },
  { pattern: '/api/auth/update-user', module: r21 as unknown as RouteModule },
  { pattern: '/api/automations/cron', module: r22 as unknown as RouteModule },
  { pattern: '/api/automations/engine', module: r23 as unknown as RouteModule },
  { pattern: '/api/flows/cron', module: r24 as unknown as RouteModule },
  { pattern: '/api/flows/templates', module: r25 as unknown as RouteModule },
  { pattern: '/api/realtime/broadcast', module: r26 as unknown as RouteModule },
  { pattern: '/api/realtime/sse', module: r27 as unknown as RouteModule },
  { pattern: '/api/v1/broadcasts', module: r28 as unknown as RouteModule },
  { pattern: '/api/v1/contacts', module: r29 as unknown as RouteModule },
  { pattern: '/api/v1/conversations', module: r30 as unknown as RouteModule },
  { pattern: '/api/v1/me', module: r31 as unknown as RouteModule },
  { pattern: '/api/v1/messages', module: r32 as unknown as RouteModule },
  { pattern: '/api/v1/webhooks', module: r33 as unknown as RouteModule },
  { pattern: '/api/whatsapp/broadcast', module: r34 as unknown as RouteModule },
  { pattern: '/api/whatsapp/config', module: r35 as unknown as RouteModule },
  { pattern: '/api/whatsapp/react', module: r36 as unknown as RouteModule },
  { pattern: '/api/whatsapp/send', module: r37 as unknown as RouteModule },
  { pattern: '/api/whatsapp/webhook', module: r38 as unknown as RouteModule },
  { pattern: '/api/ai/knowledge/reindex', module: r39 as unknown as RouteModule },
  { pattern: '/api/auth/oidc/callback', module: r40 as unknown as RouteModule },
  { pattern: '/api/auth/oidc/login', module: r41 as unknown as RouteModule },
  { pattern: '/api/whatsapp/config/verify-registration', module: r42 as unknown as RouteModule },
  { pattern: '/api/whatsapp/templates/submit', module: r43 as unknown as RouteModule },
  { pattern: '/api/whatsapp/templates/sync', module: r44 as unknown as RouteModule },
  { pattern: '/api/account/api-keys/:id', module: r45 as unknown as RouteModule },
  { pattern: '/api/account/invitations/:id', module: r46 as unknown as RouteModule },
  { pattern: '/api/account/members/:userId', module: r47 as unknown as RouteModule },
  { pattern: '/api/ai/knowledge/:id', module: r48 as unknown as RouteModule },
  { pattern: '/api/v1/broadcasts/:id', module: r49 as unknown as RouteModule },
  { pattern: '/api/v1/contacts/:id', module: r50 as unknown as RouteModule },
  { pattern: '/api/v1/conversations/:id', module: r51 as unknown as RouteModule },
  { pattern: '/api/v1/webhooks/:id', module: r52 as unknown as RouteModule },
  { pattern: '/api/whatsapp/media/:mediaId', module: r53 as unknown as RouteModule },
  { pattern: '/api/whatsapp/templates/:id', module: r54 as unknown as RouteModule },
  { pattern: '/api/v1/conversations/:id/messages', module: r55 as unknown as RouteModule },
  { pattern: '/api/automations/:id', module: r56 as unknown as RouteModule },
  { pattern: '/api/flows/:id', module: r57 as unknown as RouteModule },
  { pattern: '/api/storage/:bucket', module: r58 as unknown as RouteModule },
  { pattern: '/api/automations/:id/duplicate', module: r59 as unknown as RouteModule },
  { pattern: '/api/flows/:id/activate', module: r60 as unknown as RouteModule },
  { pattern: '/api/flows/:id/runs', module: r61 as unknown as RouteModule },
  { pattern: '/api/invitations/:token/peek', module: r62 as unknown as RouteModule },
  { pattern: '/api/invitations/:token/redeem', module: r63 as unknown as RouteModule },
  { pattern: '/api/storage/:bucket/:path{.+}', module: r64 as unknown as RouteModule },
];
