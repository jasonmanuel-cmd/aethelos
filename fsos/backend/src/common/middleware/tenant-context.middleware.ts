import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = (req.headers['x-tenant-id'] as string) || (req as any).user?.tenant_id;

    if (!tenantId) {
      return res.status(401).json({
        title: 'Missing Tenant',
        status: 401,
        detail: 'Missing active tenant verification header',
        request_id: (req as any).id,
      });
    }

    // Set tenant context at session level so pooled connections see it
    await this.dataSource.query(
      `SELECT set_config('app.current_tenant_id', $1, false)`,
      [tenantId]
    );

    (req as any).tenantId = tenantId;
    next();
  }
}
