import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogsService {
  constructor(private prisma: PrismaService) {}

  arl()        { return this.prisma.arl.findMany({ orderBy: { name: 'asc' } }); }
  eps()        { return this.prisma.eps.findMany({ orderBy: { name: 'asc' } }); }
  pension()    { return this.prisma.pensionFund.findMany({ orderBy: { name: 'asc' } }); }
}
