import { Repository } from 'typeorm';
import { StoreItem } from '../database/entities/store-item.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StoreItemService {
  constructor(
    @InjectRepository(StoreItem) private repo: Repository<StoreItem>,
  ) {}

  async getAll() {
    return this.repo.find();
  }
}
