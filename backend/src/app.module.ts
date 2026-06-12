import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { config } from './config';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { HouseholdsModule } from './modules/households/households.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { CarriersModule } from './modules/carriers/carriers.module';
import { XDateModule } from './modules/xdate/xdate.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AgentsModule } from './modules/agents/agents.module';
import { McpGatewayModule } from './modules/mcp-gateway/mcp-gateway.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.database.url,
      poolSize: config.database.poolSize,
      autoLoadEntities: true,
      synchronize: false,
      logging: !config.isProd,
      ssl: config.isProd ? { rejectUnauthorized: false } : false,
    }),
    BullModule.forRoot({
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: config.rateLimit.ttl * 1000,
      limit: config.rateLimit.limit,
    }]),
    HouseholdsModule,
    ContactsModule,
    PoliciesModule,
    CarriersModule,
    XDateModule,
    AssessmentsModule,
    WorkflowsModule,
    AgentsModule,
    McpGatewayModule,
    AppointmentsModule,
    PipelinesModule,
    CommunicationsModule,
    AnalyticsModule,
    TenantModule,
    ApiKeysModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, TenantContextMiddleware)
      .forRoutes('*');
  }
}
