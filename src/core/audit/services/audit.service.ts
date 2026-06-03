import {
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Audit } from "../entities/audit.entity";

export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
  ) {}

  async createLog(data: {
    userId?: string;
    action: string;
    method: string;
    url: string;
    payload?: any;
    ip: string;
  }) {
    try {
      const log = this.auditRepository.create({
        userId: data.userId,
        action: data.action,
        method: data.method,
        url: data.url,
        payload: data.payload ? JSON.stringify(data.payload) : null,
        ip: data.ip,
      });

      return await this.auditRepository.save(log);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear log de auditoría');
    }
  }
}