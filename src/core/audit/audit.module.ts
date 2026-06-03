@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    providers: [AuditService, AuditInterceptor],
    exports: [AuditService, AuditInterceptor], 
  })
  export class AuditModule {}